import sys
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QTreeWidget, QTreeWidgetItem, QPushButton, 
                             QLabel, QLineEdit, QComboBox, QTabWidget)
from PySide6.QtCore import Qt
from pymongo import MongoClient
import pandas as pd
from datetime import datetime
import json

class MongoDBManager(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("MongoDB Manager")
        self.setGeometry(100, 100, 1200, 800)
        
        # MongoDB 연결 설정
        self.setup_mongodb()
        
        # 메인 위젯 설정
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QHBoxLayout(main_widget)
        
        # 좌측 패널 (데이터베이스 구조)
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        
        # 데이터베이스 트리
        self.db_tree = QTreeWidget()
        self.db_tree.setHeaderLabels(["Database Structure"])
        self.populate_db_tree()
        left_layout.addWidget(self.db_tree)
        
        # 우측 패널 (데이터 뷰어/에디터)
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        
        # 탭 위젯
        self.tab_widget = QTabWidget()
        self.setup_tabs()
        right_layout.addWidget(self.tab_widget)
        
        # 레이아웃에 패널 추가
        layout.addWidget(left_panel, 1)
        layout.addWidget(right_panel, 2)
        
        # 초기 데이터 로드
        self.load_data()

    def setup_mongodb(self):
        """MongoDB 연결 설정"""
        try:
            self.uri = "mongodb+srv://shinws8908:dnfhlao1@cluster0.h7c55.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
            self.client = MongoClient(self.uri)
            self.db = self.client['scraping_db']
            print("MongoDB 연결 성공")
        except Exception as e:
            print(f"MongoDB 연결 실패: {str(e)}")
            sys.exit(1)

    def populate_db_tree(self):
        """데이터베이스 구조를 트리로 표시"""
        try:
            root = QTreeWidgetItem(self.db_tree, ["scraping_db"])
            
            collections = self.db.list_collection_names()
            for collection in collections:
                collection_item = QTreeWidgetItem(root, [collection])
                sample_doc = self.db[collection].find_one()
                if sample_doc:
                    self.add_document_structure(collection_item, sample_doc)
                    
            self.db_tree.expandAll()
        except Exception as e:
            print(f"데이터베이스 구조 로딩 실패: {str(e)}")

    def add_document_structure(self, parent, doc):
        """문서 구조를 트리 아이템으로 추가"""
        for key, value in doc.items():
            if isinstance(value, dict):
                item = QTreeWidgetItem(parent, [f"{key} (Object)"])
                self.add_document_structure(item, value)
            elif isinstance(value, list):
                item = QTreeWidgetItem(parent, [f"{key} (Array)"])
                if value and isinstance(value[0], dict):
                    self.add_document_structure(item, value[0])
            else:
                value_type = type(value).__name__
                QTreeWidgetItem(parent, [f"{key}: {value_type}"])

    def setup_tabs(self):
        """탭 설정"""
        # Users 탭
        users_tab = QWidget()
        users_layout = QVBoxLayout(users_tab)
        
        # 사용자 검색
        search_layout = QHBoxLayout()
        search_layout.addWidget(QLabel("Search:"))
        self.user_search = QLineEdit()
        self.user_search.textChanged.connect(lambda: self.filter_data('users'))
        search_layout.addWidget(self.user_search)
        users_layout.addLayout(search_layout)
        
        # 사용자 목록
        self.users_tree = QTreeWidget()
        self.users_tree.setHeaderLabels(["Email", "Name", "Membership", "Credits"])
        users_layout.addWidget(self.users_tree)
        
        self.tab_widget.addTab(users_tab, "Users")
        
        # Markets 탭
        markets_tab = self.setup_markets_tab()
        self.tab_widget.addTab(markets_tab, "Markets")
        
        # Products 탭
        products_tab = self.setup_products_tab()
        self.tab_widget.addTab(products_tab, "Products")

    def setup_markets_tab(self):
        """마켓 탭 설정"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # 검색 및 필터
        filter_layout = QHBoxLayout()
        filter_layout.addWidget(QLabel("Search:"))
        self.market_search = QLineEdit()
        self.market_search.textChanged.connect(lambda: self.filter_data('markets'))
        filter_layout.addWidget(self.market_search)
        layout.addLayout(filter_layout)
        
        # 마켓 트리
        self.markets_tree = QTreeWidget()
        self.markets_tree.setHeaderLabels([
            "Market Name", "Grade", "Customer Count", 
            "Male Ratio", "Female Ratio", "URL"
        ])
        layout.addWidget(self.markets_tree)
        
        return tab

    def setup_products_tab(self):
        """상품 탭 설정"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # 검색 및 필터
        filter_layout = QHBoxLayout()
        filter_layout.addWidget(QLabel("Search:"))
        self.product_search = QLineEdit()
        self.product_search.textChanged.connect(lambda: self.filter_data('products'))
        filter_layout.addWidget(self.product_search)
        layout.addLayout(filter_layout)
        
        # 상품 트리
        self.products_tree = QTreeWidget()
        self.products_tree.setHeaderLabels([
            "Title", "Price", "Market", "Collection Date",
            "Reviews", "Purchases"
        ])
        layout.addWidget(self.products_tree)
        
        return tab

    def load_data(self):
        """데이터 로드"""
        try:
            # Users 데이터
            users = self.db.users.find()
            for user in users:
                user_info = user.get('user_info', {})
                item = QTreeWidgetItem(self.users_tree)
                item.setText(0, user_info.get('email', ''))
                item.setText(1, user_info.get('name', ''))
                item.setText(2, user_info.get('membershipLevel', ''))
                item.setText(3, str(user_info.get('remainingCredits', 0)))
            
            # Markets 데이터
            markets = self.db.users.aggregate([
                {"$unwind": "$collected_markets"},
                {"$project": {"market": "$collected_markets"}}
            ])
            
            for market_doc in markets:
                market = market_doc.get('market', {})
                item = QTreeWidgetItem(self.markets_tree)
                item.setText(0, market.get('mallName', ''))
                item.setText(1, market.get('mallGrade', ''))
                item.setText(2, str(market.get('customerCount', 0)))
                item.setText(3, f"{market.get('genderRatio', {}).get('male', 0)}%")
                item.setText(4, f"{market.get('genderRatio', {}).get('female', 0)}%")
                item.setText(5, market.get('mallUrl', ''))
            
            # Products 데이터
            products = self.db.users.aggregate([
                {"$unwind": "$collected_products"},
                {"$project": {"product": "$collected_products"}}
            ])
            
            for product_doc in products:
                product = product_doc.get('product', {})
                item = QTreeWidgetItem(self.products_tree)
                item.setText(0, product.get('title', ''))
                item.setText(1, f"{product.get('price', 0):,}원")
                item.setText(2, product.get('mall_name', ''))
                item.setText(3, product.get('collection_date', '').split('T')[0])
                item.setText(4, str(product.get('review_count', 0)))
                item.setText(5, str(product.get('purchase_count', 0)))
                
        except Exception as e:
            print(f"데이터 로드 실패: {str(e)}")

    def filter_data(self, tab_name):
        """데이터 필터링"""
        search_text = ''
        tree = None
        
        if tab_name == 'users':
            search_text = self.user_search.text().lower()
            tree = self.users_tree
        elif tab_name == 'markets':
            search_text = self.market_search.text().lower()
            tree = self.markets_tree
        elif tab_name == 'products':
            search_text = self.product_search.text().lower()
            tree = self.products_tree
            
        if tree:
            for i in range(tree.topLevelItemCount()):
                item = tree.topLevelItem(i)
                show = False
                for j in range(tree.columnCount()):
                    if search_text in item.text(j).lower():
                        show = True
                        break
                item.setHidden(not show)

def main():
    app = QApplication(sys.argv)
    window = MongoDBManager()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
