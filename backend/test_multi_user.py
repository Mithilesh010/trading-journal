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

    print(">>> 4. Testing Trade Creation for User A...")
    # Alice Trade 1: BUY NIFTY, TP Hit
    res = client.post('/api/trades', headers=headers_a, json={
        'trade_date': '2026-09-08',
        'entry_time': '09:30',
        'exit_time': '11:15',
        'market_type': 'Indian Market',
        'instrument': 'NIFTY',
        'position': 'BUY',
        'quantity': 50,
        'strategy': 'Breakout',
        'rr': '1:3',
        'status': 'TP Hit',
        'notes': 'Strong trend day'
    })
    assert res.status_code == 201
    trade_a1 = res.get_json()['trade']
    assert trade_a1['instrument'] == 'NIFTY'
    assert trade_a1['rr'] == '1:3'
    assert trade_a1['status'] == 'TP Hit'

    # Alice Trade 2: SELL BANKNIFTY, SL Hit
    res = client.post('/api/trades', headers=headers_a, json={
        'trade_date': '2026-09-09',
        'entry_time': '13:00',
        'exit_time': '14:30',
        'market_type': 'Indian Market',
        'instrument': 'BANKNIFTY',
        'position': 'SELL',
        'quantity': 15,
        'strategy': 'Mean Reversion',
        'rr': '1:2',
        'status': 'SL Hit'
    })
    assert res.status_code == 201
    trade_a2 = res.get_json()['trade']
    assert trade_a2['status'] == 'SL Hit'

    # Alice Trade 3: BUY BTC, TP Hit
    res = client.post('/api/trades', headers=headers_a, json={
        'trade_date': '2026-09-10',
        'entry_time': '10:00',
        'market_type': 'Crypto Market',
        'instrument': 'BTC',
        'position': 'BUY',
        'lot_size': 0.001,
        'lots': 100,
        'strategy': 'Momentum',
        'rr': '1:2',
        'status': 'TP Hit'
    })
    assert res.status_code == 201
    trade_a3 = res.get_json()['trade']
    assert trade_a3['market_type'] == 'Crypto Market'

    print(">>> 5. Testing Trade Creation for User B...")
    # Bob Trade 1: SELL EURUSD, TP Hit
    res = client.post('/api/trades', headers=headers_b, json={
        'trade_date': '2026-09-10',
        'entry_time': '15:00',
        'exit_time': '16:00',
        'market_type': 'Forex Market',
        'instrument': 'EURUSD',
        'position': 'SELL',
        'lot_size': 100000,
        'lots': 1,
        'strategy': 'Scalping',
        'rr': '1:1.5',
        'status': 'TP Hit'
    })
    assert res.status_code == 201
    trade_b1 = res.get_json()['trade']
    assert trade_b1['instrument'] == 'EURUSD'
    assert trade_b1['market_type'] == 'Forex Market'

    print(">>> 6. STRICT DATA ISOLATION VERIFICATION...")
    # Alice queries trades -> Must see only 3 trades
    res = client.get('/api/trades', headers=headers_a)
    assert res.status_code == 200
    alice_trades = res.get_json()['trades']
    assert len(alice_trades) == 3
    alice_instruments = {t['instrument'] for t in alice_trades}
    assert 'EURUSD' not in alice_instruments

    # Bob queries trades -> Must see only 1 trade
    res = client.get('/api/trades', headers=headers_b)
    assert res.status_code == 200
    bob_trades = res.get_json()['trades']
    assert len(bob_trades) == 1
    assert bob_trades[0]['instrument'] == 'EURUSD'

    # Alice attempts to access Bob's trade by ID -> Must receive 404
    res = client.get(f"/api/trades/{trade_b1['id']}", headers=headers_a)
    assert res.status_code == 404, f"SECURITY LEAK: Alice was able to read Bob's trade! Status: {res.status_code}"

    # Bob attempts to update Alice's trade -> Must receive 404
    res = client.put(f"/api/trades/{trade_a1['id']}", headers=headers_b, json={'notes': 'Hacked!'})
    assert res.status_code == 404, f"SECURITY LEAK: Bob was able to update Alice's trade! Status: {res.status_code}"

    # Bob attempts to delete Alice's trade -> Must receive 404
    res = client.delete(f"/api/trades/{trade_a1['id']}", headers=headers_b)
    assert res.status_code == 404, f"SECURITY LEAK: Bob was able to delete Alice's trade! Status: {res.status_code}"

    print(">>> 7. Testing Dashboard Metrics Isolation...")
    # Alice Dashboard
    res = client.get('/api/dashboard', headers=headers_a)
    assert res.status_code == 200
    metrics_a = res.get_json()['metrics']
    assert metrics_a['total_trades'] == 3
    assert metrics_a['tp_hits'] == 2
    assert metrics_a['sl_hits'] == 1
    assert metrics_a['win_rate'] == 66.67

    # Bob Dashboard
    res = client.get('/api/dashboard', headers=headers_b)
    assert res.status_code == 200
    metrics_b = res.get_json()['metrics']
    assert metrics_b['total_trades'] == 1
    assert metrics_b['tp_hits'] == 1
    assert metrics_b['sl_hits'] == 0
    assert metrics_b['win_rate'] == 100.0

    print(">>> 8. Testing Export Isolation...")
    # Alice Excel
    res = client.get(f'/api/export/excel?token={token_a}')
    assert res.status_code == 200
    assert res.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    # Bob PDF
    res = client.get(f'/api/export/pdf?token={token_b}')
    assert res.status_code == 200
    assert res.mimetype == 'application/pdf'

    print("==================================================")
    print("ALL MULTI-USER DATA ISOLATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == '__main__':
    run_multi_user_tests()
