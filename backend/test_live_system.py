import os
import io
import json
import urllib.request
from app import create_app
from config import Config
from models import db, User, Trade, Journal

def test_full_system():
    app = create_app(Config)
    client = app.test_client()

    with app.app_context():
        # Clear or ensure fresh state for test users
        u1 = User.query.filter_by(email='mithilesh.trader@terminal.io').first()
        if u1:
            db.session.delete(u1)
        u2 = User.query.filter_by(email='crypto.trader@terminal.io').first()
        if u2:
            db.session.delete(u2)
        db.session.commit()

    print("--- 1. Testing Health Endpoint ---")
    res = client.get('/api/health')
    assert res.status_code == 200
    assert res.get_json()['status'] == 'healthy'
    print("Health check passed.")

    print("--- 2. Registering Primary Test User ---")
    res = client.post('/api/auth/signup', json={
        'name': 'Mithilesh Kumar',
        'email': 'mithilesh.trader@terminal.io',
        'phone': '+91 9988776655',
        'password': 'tradingmaster123',
        'confirm_password': 'tradingmaster123'
    })
    assert res.status_code == 201
    print("User registered successfully.")

    print("--- 3. Logging in and receiving JWT ---")
    res = client.post('/api/auth/login', json={
        'email': 'mithilesh.trader@terminal.io',
        'password': 'tradingmaster123'
    })
    assert res.status_code == 200
    token = res.get_json()['access_token']
    auth_headers = {'Authorization': f'Bearer {token}'}
    print("Login successful, JWT acquired.")

    print("--- 4. Recording Trades with Real Formulas ---")
    # Trade 1: NIFTY BUY
    res = client.post('/api/trades', headers=auth_headers, json={
        'trade_date': '2026-09-08',
        'entry_time': '09:30',
        'exit_time': '10:45',
        'instrument': 'NIFTY 24500 CE',
        'side': 'BUY',
        'quantity': 100,
        'entry_price': 140,
        'exit_price': 195,
        'stop_loss': 120,
        'target': 200,
        'strategy': 'Morning Breakout',
        'setup': '15m Opening Range Breakout',
        'entry_reason': 'Index broke above previous day high with strong market breadth.',
        'exit_reason': 'Approached psychological 24500 resistance, locked profits.',
        'notes': 'Followed plan without hesitation.',
        'status': 'Closed'
    })
    assert res.status_code == 201
    t1 = res.get_json()['trade']
    assert t1['pnl'] == 5500.0  # (195 - 140) * 100 = +5500
    assert t1['risk'] == 20.0   # 140 - 120 = 20
    assert t1['reward'] == 60.0 # 200 - 140 = 60
    assert t1['rr_ratio'] == 3.0 # 60 / 20 = 3.0

    # Trade 2: BANKNIFTY SELL (Short)
    res = client.post('/api/trades', headers=auth_headers, json={
        'trade_date': '2026-09-09',
        'entry_time': '13:15',
        'exit_time': '14:30',
        'instrument': 'BANKNIFTY 51500 PE',
        'side': 'SELL',
        'quantity': 30,
        'entry_price': 380,
        'exit_price': 420,
        'stop_loss': 430,
        'target': 280,
        'strategy': 'Mean Reversion',
        'setup': 'Failed High rejection',
        'entry_reason': 'RSI bearish divergence on 5m chart.',
        'exit_reason': 'Stop loss hit on sudden short-covering spike.',
        'notes': 'Good loss, respected stop strictly.',
        'status': 'Closed'
    })
    assert res.status_code == 201
    t2 = res.get_json()['trade']
    assert t2['pnl'] == -1200.0  # (380 - 420) * 30 = -1200
    assert t2['risk'] == 50.0    # 430 - 380 = 50
    assert t2['reward'] == 100.0 # 380 - 280 = 100
    assert t2['rr_ratio'] == 2.0 # 100 / 50 = 2.0

    # Trade 3: Open active trade
    res = client.post('/api/trades', headers=auth_headers, json={
        'trade_date': '2026-09-10',
        'entry_time': '11:00',
        'instrument': 'TCS',
        'side': 'BUY',
        'quantity': 25,
        'entry_price': 4200,
        'stop_loss': 4150,
        'target': 4350,
        'strategy': 'Swing Pullback',
        'setup': 'Daily 20 EMA bounce',
        'status': 'Open'
    })
    assert res.status_code == 201
    t3 = res.get_json()['trade']
    assert t3['status'] == 'Open'
    assert t3['pnl'] is None

    print("Trades created and validated successfully.")

    print("--- 5. Testing Trade Screenshot Upload ---")
    dummy_image = io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')
    res = client.put(f"/api/trades/{t1['id']}", headers={'Authorization': f'Bearer {token}'}, data={
        'screenshot': (dummy_image, 'nifty_breakout.png')
    }, content_type='multipart/form-data')
    assert res.status_code == 200
    assert res.get_json()['trade']['has_screenshot'] is True

    # Fetch screenshot
    res_img = client.get(f"/api/trades/{t1['id']}/screenshot", headers=auth_headers)
    assert res_img.status_code == 200
    assert len(res_img.data) > 0
    print("Screenshot uploaded and securely retrieved.")

    print("--- 6. Testing Dashboard Calculations ---")
    res_dash = client.get('/api/dashboard', headers=auth_headers)
    assert res_dash.status_code == 200
    m = res_dash.get_json()['metrics']
    assert m['total_trades'] == 3
    assert m['closed_trades'] == 2
    assert m['open_trades'] == 1
    assert m['winning_trades'] == 1
    assert m['losing_trades'] == 1
    assert m['win_rate'] == 50.0
    assert m['total_pnl'] == 4300.0 # 5500 - 1200 = +4300
    assert m['profit_factor'] == round(5500 / 1200, 2)
    print(f"Dashboard metrics verified: Total P&L = +INR {m['total_pnl']}, Win Rate = {m['win_rate']}%, Profit Factor = {m['profit_factor']}")

    print("--- 7. Testing Analytics Calculations ---")
    res_an = client.get('/api/analytics', headers=auth_headers)
    assert res_an.status_code == 200
    an = res_an.get_json()
    assert an['has_data'] is True
    assert len(an['equity_curve']) >= 2
    assert len(an['daily_pnl']) >= 2
    print("Analytics metrics verified.")

    print("--- 8. Testing Journal CRUD ---")
    res_j = client.post('/api/journal', headers=auth_headers, json={
        'title': 'Patience and Sizing Review',
        'journal_date': '2026-09-08',
        'market': 'NIFTY Options',
        'mood': 'Disciplined',
        'notes': 'Maintained tight stop on the second trade and did not revenge trade.',
        'lesson': 'Protecting capital on red trades is what preserves equity.'
    })
    assert res_j.status_code == 201
    j_id = res_j.get_json()['journal']['id']

    # Update journal
    res_j_up = client.put(f"/api/journal/{j_id}", headers=auth_headers, json={
        'mood': 'Calm & Focused'
    })
    assert res_j_up.status_code == 200
    assert res_j_up.get_json()['journal']['mood'] == 'Calm & Focused'
    print("Journal CRUD verified.")

    print("--- 9. Testing Excel and PDF Generation ---")
    res_xl = client.get('/api/export/excel?range=all', headers=auth_headers)
    assert res_xl.status_code == 200
    assert len(res_xl.data) > 2000

    res_pdf = client.get('/api/export/pdf?range=all', headers=auth_headers)
    assert res_pdf.status_code == 200
    assert len(res_pdf.data) > 2000
    print("Excel and PDF exports generated and verified.")

    print("\n=======================================================")
    print(" ALL SYSTEM VERIFICATION CHECKS PASSED END-TO-END!    ")
    print("=======================================================\n")

if __name__ == '__main__':
    test_full_system()
