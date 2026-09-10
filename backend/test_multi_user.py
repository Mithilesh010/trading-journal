import os
import io
import json
from app import create_app
from config import Config
from models import db, User, Trade, Journal

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

def run_multi_user_tests():
    app = create_app(TestConfig)
    client = app.test_client()

    with app.app_context():
        db.create_all()

    print(">>> 1. Testing Signup for User A and User B...")
    # Signup User A
    res = client.post('/api/auth/signup', json={
        'name': 'Trader Alice',
        'email': 'alice@example.com',
        'phone': '+91 9876543210',
        'password': 'password123',
        'confirm_password': 'password123'
    })
    assert res.status_code == 201, f"User A signup failed: {res.data}"

    # Signup User B
    res = client.post('/api/auth/signup', json={
        'name': 'Trader Bob',
        'email': 'bob@example.com',
        'phone': '+91 9123456780',
        'password': 'password456',
        'confirm_password': 'password456'
    })
    assert res.status_code == 201, f"User B signup failed: {res.data}"

    print(">>> 2. Testing Login and JWT Token Generation...")
    # Login User A
    res = client.post('/api/auth/login', json={
        'email': 'alice@example.com',
        'password': 'password123'
    })
    assert res.status_code == 200
    token_a = res.get_json()['access_token']
    headers_a = {'Authorization': f'Bearer {token_a}'}

    # Login User B
    res = client.post('/api/auth/login', json={
        'email': 'bob@example.com',
        'password': 'password456'
    })
    assert res.status_code == 200
    token_b = res.get_json()['access_token']
    headers_b = {'Authorization': f'Bearer {token_b}'}

    print(">>> 3. Testing Protected /api/auth/me...")
    res_me_a = client.get('/api/auth/me', headers=headers_a)
    assert res_me_a.status_code == 200
    assert res_me_a.get_json()['user']['email'] == 'alice@example.com'

    res_me_b = client.get('/api/auth/me', headers=headers_b)
    assert res_me_b.status_code == 200
    assert res_me_b.get_json()['user']['email'] == 'bob@example.com'

    print(">>> 4. Testing Trade Creation and P&L / R:R Calculations for User A...")
    # Alice Trade 1: BUY NIFTY, Closed with profit
    # Entry: 24000, Exit: 24200, Qty: 50 -> P&L = +10,000. SL: 23900 -> Risk: 100, Target: 24300 -> Reward: 300 -> R:R = 3.0
    res = client.post('/api/trades', headers=headers_a, json={
        'trade_date': '2026-09-08',
        'entry_time': '09:30',
        'exit_time': '11:15',
        'instrument': 'NIFTY 24000 CE',
        'side': 'BUY',
        'quantity': 50,
        'entry_price': 24000,
        'exit_price': 24200,
        'stop_loss': 23900,
        'target': 24300,
        'strategy': 'Breakout',
        'setup': '15m ORB',
        'status': 'Closed',
        'notes': 'Strong trend day'
    })
    assert res.status_code == 201
    trade_a1 = res.get_json()['trade']
    assert trade_a1['pnl'] == 10000.0
    assert trade_a1['risk'] == 100.0
    assert trade_a1['reward'] == 300.0
    assert trade_a1['rr_ratio'] == 3.0
    assert trade_a1['status'] == 'Closed'

    # Alice Trade 2: SELL BANKNIFTY, Closed with loss
    # Entry: 51000, Exit: 51200, Qty: 15 -> P&L = (51000 - 51200)*15 = -3000.
    res = client.post('/api/trades', headers=headers_a, json={
        'trade_date': '2026-09-09',
        'entry_time': '13:00',
        'exit_time': '14:30',
        'instrument': 'BANKNIFTY 51000 PE',
        'side': 'SELL',
        'quantity': 15,
        'entry_price': 51000,
        'exit_price': 51200,
        'stop_loss': 51300,
        'target': 50400,
        'strategy': 'Mean Reversion',
        'status': 'Closed'
    })
    assert res.status_code == 201
    trade_a2 = res.get_json()['trade']
    assert trade_a2['pnl'] == -3000.0
    assert trade_a2['risk'] == 300.0
    assert trade_a2['reward'] == 600.0
    assert trade_a2['rr_ratio'] == 2.0

    # Alice Trade 3: Open trade
    res = client.post('/api/trades', headers=headers_a, json={
        'trade_date': '2026-09-10',
        'entry_time': '10:00',
        'instrument': 'RELIANCE',
        'side': 'BUY',
        'quantity': 100,
        'entry_price': 3000,
        'stop_loss': 2950,
        'target': 3150,
        'strategy': 'Swing',
        'status': 'Open'
    })
    assert res.status_code == 201
    trade_a3 = res.get_json()['trade']
    assert trade_a3['status'] == 'Open'
    assert trade_a3['pnl'] is None

    print(">>> 5. Testing Trade Creation for User B...")
    # Bob Trade 1: BUY BTC/USDT
    res = client.post('/api/trades', headers=headers_b, json={
        'trade_date': '2026-09-10',
        'entry_time': '15:00',
        'exit_time': '16:00',
        'instrument': 'BTC/USDT',
        'side': 'BUY',
        'quantity': 0.5,
        'entry_price': 60000,
        'exit_price': 62000,
        'stop_loss': 59000,
        'target': 63000,
        'strategy': 'Crypto Momentum',
        'status': 'Closed'
    })
    assert res.status_code == 201
    trade_b1 = res.get_json()['trade']
    assert trade_b1['pnl'] == 1000.0

    print(">>> 6. TESTING STRICT MULTI-USER ISOLATION...")
    # Alice gets all trades: should see exactly 3 trades
    res = client.get('/api/trades', headers=headers_a)
    assert res.status_code == 200
    alice_trades = res.get_json()['trades']
    assert len(alice_trades) == 3
    alice_instruments = {t['instrument'] for t in alice_trades}
    assert 'BTC/USDT' not in alice_instruments

    # Bob gets all trades: should see exactly 1 trade (BTC/USDT)
    res = client.get('/api/trades', headers=headers_b)
    assert res.status_code == 200
    bob_trades = res.get_json()['trades']
    assert len(bob_trades) == 1
    assert bob_trades[0]['instrument'] == 'BTC/USDT'

    # Alice tries to GET Bob's trade
    res = client.get(f"/api/trades/{trade_b1['id']}", headers=headers_a)
    assert res.status_code == 404, f"Security Breach! Alice was able to fetch Bob's trade: {res.status_code}"

    # Alice tries to UPDATE Bob's trade
    res = client.put(f"/api/trades/{trade_b1['id']}", headers=headers_a, json={'notes': 'Hacked by Alice'})
    assert res.status_code == 404, f"Security Breach! Alice was able to update Bob's trade: {res.status_code}"

    # Alice tries to DELETE Bob's trade
    res = client.delete(f"/api/trades/{trade_b1['id']}", headers=headers_a)
    assert res.status_code == 404, f"Security Breach! Alice was able to delete Bob's trade: {res.status_code}"

    # Verify Bob's trade still exists and is untouched
    res = client.get(f"/api/trades/{trade_b1['id']}", headers=headers_b)
    assert res.status_code == 200
    assert res.get_json()['trade']['notes'] != 'Hacked by Alice'

    print(">>> 7. Testing Dashboard & Analytics Multi-User Isolation...")
    # Alice Dashboard: Total 3 trades, 2 closed, Total P&L = 10000 - 3000 = +7000. Win rate = 50%
    res_dash_a = client.get('/api/dashboard', headers=headers_a)
    assert res_dash_a.status_code == 200
    dash_a = res_dash_a.get_json()['metrics']
    assert dash_a['total_trades'] == 3
    assert dash_a['closed_trades'] == 2
    assert dash_a['winning_trades'] == 1
    assert dash_a['losing_trades'] == 1
    assert dash_a['win_rate'] == 50.0
    assert dash_a['total_pnl'] == 7000.0

    # Bob Dashboard: Total 1 trade, 1 closed, Total P&L = +1000. Win rate = 100%
    res_dash_b = client.get('/api/dashboard', headers=headers_b)
    assert res_dash_b.status_code == 200
    dash_b = res_dash_b.get_json()['metrics']
    assert dash_b['total_trades'] == 1
    assert dash_b['closed_trades'] == 1
    assert dash_b['winning_trades'] == 1
    assert dash_b['total_pnl'] == 1000.0
    assert dash_b['win_rate'] == 100.0

    print(">>> 8. Testing Journal CRUD & Multi-User Isolation...")
    # Alice creates journal
    res = client.post('/api/journal', headers=headers_a, json={
        'title': 'Patience and Discipline on Expiry',
        'journal_date': '2026-09-08',
        'market': 'Indian Equities',
        'mood': 'Disciplined',
        'notes': 'Stuck to my 15m ORB rules and avoided overtrading.',
        'lesson': 'Cut losses quickly, let winners run.'
    })
    assert res.status_code == 201
    journal_a = res.get_json()['journal']

    # Bob gets journals -> should see 0
    res_j_b = client.get('/api/journal', headers=headers_b)
    assert res_j_b.status_code == 200
    assert len(res_j_b.get_json()['journals']) == 0

    # Bob attempts to access Alice's journal
    res_j_cross = client.get(f"/api/journal/{journal_a['id']}", headers=headers_b)
    assert res_j_cross.status_code == 404, "Security Breach! Bob accessed Alice's journal"

    # Bob attempts to delete Alice's journal
    res_j_del = client.delete(f"/api/journal/{journal_a['id']}", headers=headers_b)
    assert res_j_del.status_code == 404, "Security Breach! Bob deleted Alice's journal"

    print(">>> 9. Testing Excel and PDF Exports...")
    # Alice Excel Export
    res_excel = client.get('/api/export/excel?range=all', headers=headers_a)
    assert res_excel.status_code == 200
    assert 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' in res_excel.content_type
    assert len(res_excel.data) > 1000

    # Alice PDF Export
    res_pdf = client.get('/api/export/pdf?range=all', headers=headers_a)
    assert res_pdf.status_code == 200
    assert 'application/pdf' in res_pdf.content_type
    assert len(res_pdf.data) > 1000

    print("\n=======================================================")
    print(" ALL BACKEND MULTI-USER ISOLATION TESTS PASSED 100%! ")
    print("=======================================================\n")

if __name__ == '__main__':
    run_multi_user_tests()
