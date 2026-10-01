import os
import sys
import unittest
import json
from datetime import date

# Add backend to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from app import create_app
from models import db, User, Trade

class ValidationTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.client = cls.app.test_client()

        with cls.app.app_context():
            # Get or create test user
            user = User.query.filter_by(email='test_validator@example.com').first()
            if not user:
                user = User(name='Test Trader', email='test_validator@example.com')
                user.set_password('Password123')
                db.session.add(user)
                db.session.commit()
            cls.user_id = user.id

            # Clean previous test trades for this user
            Trade.query.filter_by(user_id=user.id).delete()
            db.session.commit()

        # Login to get JWT
        res = cls.client.post('/api/auth/login', json={
            'email': 'test_validator@example.com',
            'password': 'Password123'
        })
        assert res.status_code == 200, f"Login failed: {res.get_json()}"
        cls.token = res.get_json()['access_token']
        cls.headers = {
            'Authorization': f"Bearer {cls.token}",
            'Content-Type': 'application/json'
        }

    def test_01_create_indian_market_buy_trade(self):
        """Create an Indian Market BUY trade with Quantity, manual R:R, TP Hit"""
        payload = {
            'trade_date': str(date.today()),
            'entry_time': '09:30',
            'exit_time': '10:15',
            'market_type': 'Indian Market',
            'instrument': 'NIFTY',
            'position': 'BUY',
            'quantity': 50,
            'strategy': 'Opening Range Breakout',
            'notes': 'Clean 15m breakout above PDH with strong volume.',
            'rr': '1:2',
            'status': 'TP Hit'
        }
        res = self.client.post('/api/trades', json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 201, res.get_json())
        data = res.get_json()['trade']
        self.assertEqual(data['instrument'], 'NIFTY')
        self.assertEqual(data['position'], 'BUY')
        self.assertEqual(data['quantity'], 50)
        self.assertIsNone(data['lot_size'])
        self.assertEqual(data['rr'], '1:2')
        self.assertEqual(data['status'], 'TP Hit')
        self.__class__.indian_buy_id = data['id']

    def test_02_create_indian_market_sell_trade(self):
        """Create an Indian Market SELL trade with Quantity, manual R:R, SL Hit"""
        payload = {
            'trade_date': str(date.today()),
            'entry_time': '11:00',
            'exit_time': '11:45',
            'market_type': 'Indian Market',
            'instrument': 'BANKNIFTY',
            'position': 'SELL',
            'quantity': 30,
            'strategy': 'Breakdown Failure',
            'notes': 'Attempted short on breakdown but reversed rapidly.',
            'rr': '1:1.5',
            'status': 'SL Hit'
        }
        res = self.client.post('/api/trades', json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 201, res.get_json())
        data = res.get_json()['trade']
        self.assertEqual(data['instrument'], 'BANKNIFTY')
        self.assertEqual(data['position'], 'SELL')
        self.assertEqual(data['status'], 'SL Hit')
        self.__class__.indian_sell_id = data['id']

    def test_03_create_crypto_trade(self):
        """Create a Crypto Market trade with Lot Size + Lots, manual R:R, TP Hit"""
        payload = {
            'trade_date': str(date.today()),
            'entry_time': '14:00',
            'exit_time': '16:30',
            'market_type': 'Crypto Market',
            'instrument': 'BTC',
            'position': 'BUY',
            'lot_size': 0.001,
            'lots': 100,
            'strategy': 'Trend Continuation',
            'notes': 'Bullish flag on 4H chart.',
            'rr': '1:3',
            'status': 'TP Hit'
        }
        res = self.client.post('/api/trades', json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 201, res.get_json())
        data = res.get_json()['trade']
        self.assertEqual(data['market_type'], 'Crypto Market')
        self.assertEqual(data['instrument'], 'BTC')
        self.assertEqual(data['lot_size'], 0.001)
        self.assertEqual(data['lots'], 100)
        self.assertIsNone(data['quantity'])
        self.assertEqual(data['status'], 'TP Hit')

    def test_04_create_commodity_trade(self):
        """Create a Commodity Market trade with Lot Size + Lots, manual R:R, TP Hit"""
        payload = {
            'trade_date': str(date.today()),
            'entry_time': '17:00',
            'exit_time': '19:00',
            'market_type': 'Commodity Market',
            'instrument': 'XAUUSD',
            'position': 'BUY',
            'lot_size': 100,
            'lots': 2,
            'strategy': 'Support Bounce',
            'notes': 'Gold reacted strongly at key daily support.',
            'rr': '1:2.5',
            'status': 'TP Hit'
        }
        res = self.client.post('/api/trades', json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 201, res.get_json())
        data = res.get_json()['trade']
        self.assertEqual(data['market_type'], 'Commodity Market')
        self.assertEqual(data['instrument'], 'XAUUSD')
        self.assertEqual(data['lot_size'], 100)
        self.assertEqual(data['lots'], 2)
        self.assertEqual(data['status'], 'TP Hit')

    def test_05_create_forex_trade(self):
        """Create a Forex Market trade with Lot Size + Lots, manual R:R, SL Hit"""
        payload = {
            'trade_date': str(date.today()),
            'entry_time': '20:00',
            'exit_time': '21:30',
            'market_type': 'Forex Market',
            'instrument': 'EURUSD',
            'position': 'SELL',
            'lot_size': 100000,
            'lots': 1,
            'strategy': 'London/NY Overlap Pullback',
            'notes': 'Choppy price action after news release triggered SL.',
            'rr': '1:2',
            'status': 'SL Hit'
        }
        res = self.client.post('/api/trades', json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 201, res.get_json())
        data = res.get_json()['trade']
        self.assertEqual(data['market_type'], 'Forex Market')
        self.assertEqual(data['instrument'], 'EURUSD')
        self.assertEqual(data['status'], 'SL Hit')

    def test_06_verify_terminal_and_market_filters(self):
        """Verify GET /api/trades returns correct counts and filters correctly by market"""
        # All Markets
        res_all = self.client.get('/api/trades', headers=self.headers)
        self.assertEqual(res_all.status_code, 200)
        self.assertEqual(res_all.get_json()['total'], 5)

        # Indian Market
        res_ind = self.client.get('/api/trades?market_type=Indian+Market', headers=self.headers)
        self.assertEqual(res_ind.status_code, 200)
        self.assertEqual(res_ind.get_json()['total'], 2)

        # Crypto Market
        res_crypto = self.client.get('/api/trades?market_type=Crypto+Market', headers=self.headers)
        self.assertEqual(res_crypto.status_code, 200)
        self.assertEqual(res_crypto.get_json()['total'], 1)

        # Status filter: TP Hit
        res_tp = self.client.get('/api/trades?status=TP+Hit', headers=self.headers)
        self.assertEqual(res_tp.status_code, 200)
        self.assertEqual(res_tp.get_json()['total'], 3)

        # Status filter: SL Hit
        res_sl = self.client.get('/api/trades?status=SL+Hit', headers=self.headers)
        self.assertEqual(res_sl.status_code, 200)
        self.assertEqual(res_sl.get_json()['total'], 2)

    def test_07_verify_dashboard_metrics(self):
        """Verify GET /api/dashboard returns metrics computed strictly from real trades"""
        res = self.client.get('/api/dashboard', headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        metrics = data['metrics']
        self.assertEqual(metrics['total_trades'], 5)
        self.assertEqual(metrics['tp_hits'], 3)
        self.assertEqual(metrics['sl_hits'], 2)
        self.assertEqual(metrics['win_rate'], 60.0)
        self.assertEqual(metrics['buy_trades'], 3)
        self.assertEqual(metrics['sell_trades'], 2)
        # Check trend chart exists
        self.assertTrue(len(data['trend_chart']) > 0)
        # Check recent trades list
        self.assertEqual(len(data['recent_trades']), 5)

    def test_08_verify_analytics(self):
        """Verify GET /api/analytics returns accurate strategy and market breakdowns"""
        res = self.client.get('/api/analytics', headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['overview']['win_rate'], 60.0)
        self.assertEqual(len(data['market_performance']), 4)
        self.assertEqual(len(data['win_loss_distribution']), 2)

        # Analytics for specific market
        res_crypto = self.client.get('/api/analytics?market_type=Crypto+Market', headers=self.headers)
        self.assertEqual(res_crypto.status_code, 200)
        self.assertEqual(res_crypto.get_json()['overview']['total_trades'], 1)
        self.assertEqual(res_crypto.get_json()['overview']['win_rate'], 100.0)

    def test_09_verify_profile_market_summaries(self):
        """Verify GET /api/profile separates statistics by all 4 markets"""
        res = self.client.get('/api/profile', headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        summaries = data['market_summaries']
        self.assertIn('Indian Market', summaries)
        self.assertIn('Crypto Market', summaries)
        self.assertIn('Commodity Market', summaries)
        self.assertIn('Forex Market', summaries)

        self.assertEqual(summaries['Indian Market']['total_trades'], 2)
        self.assertEqual(summaries['Indian Market']['tp_hits'], 1)
        self.assertEqual(summaries['Indian Market']['sl_hits'], 1)
        self.assertEqual(summaries['Indian Market']['win_rate'], 50.0)

        self.assertEqual(summaries['Crypto Market']['total_trades'], 1)
        self.assertEqual(summaries['Crypto Market']['tp_hits'], 1)
        self.assertEqual(summaries['Crypto Market']['win_rate'], 100.0)

    def test_10_edit_trade(self):
        """Verify PUT /api/trades/<id> updates trade record across all sections"""
        update_payload = {
            'instrument': 'NIFTY50',
            'rr': '1:2.5',
            'status': 'TP Hit',
            'notes': 'Updated trade notes with refined exit.'
        }
        res = self.client.put(f'/api/trades/{self.indian_buy_id}', json=update_payload, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()['trade']
        self.assertEqual(data['instrument'], 'NIFTY50')
        self.assertEqual(data['rr'], '1:2.5')
        self.assertEqual(data['notes'], 'Updated trade notes with refined exit.')

    def test_11_delete_trade(self):
        """Verify DELETE /api/trades/<id> removes trade"""
        res = self.client.delete(f'/api/trades/{self.indian_sell_id}', headers=self.headers)
        self.assertEqual(res.status_code, 200)
        # Verify count decreased
        res_after = self.client.get('/api/trades', headers=self.headers)
        self.assertEqual(res_after.get_json()['total'], 4)

    def test_12_export_excel(self):
        """Verify GET /api/export/excel produces valid xlsx stream"""
        res = self.client.get(f'/api/export/excel?token={self.token}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.mimetype, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        self.assertTrue(len(res.data) > 1000)

    def test_13_export_pdf(self):
        """Verify GET /api/export/pdf produces valid pdf stream"""
        res = self.client.get(f'/api/export/pdf?token={self.token}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.mimetype, 'application/pdf')
        self.assertTrue(res.data.startswith(b'%PDF'))

if __name__ == '__main__':
    unittest.main()
