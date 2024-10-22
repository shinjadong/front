import sys
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QTableWidget, QTableWidgetItem, QLineEdit, QLabel, QFileDialog, QMessageBox, QComboBox
from PySide6.QtCore import Qt
import firebase_admin
from firebase_admin import credentials, firestore
from pymongo import MongoClient
import pandas as pd
import io
from openpyxl import load_workbook
import os
import glob

# Firebase 초기화
def find_service_account_key():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    possible_names = ['serviceAccountKey.json', 'firebase-adminsdk.json', 'firebase-key.json']
    search_dirs = [current_dir, os.path.dirname(current_dir)]

    for directory in search_dirs:
        for name in possible_names:
            exact_path = os.path.join(directory, name)
            if os.path.exists(exact_path):
                return exact_path
            
            pattern = os.path.join(directory, f'*{name}')
            matches = glob.glob(pattern)
            if matches:
                return matches[0]
    
    raise FileNotFoundError("서비스 계정 키 파일을 찾을 수 없습니다.")

service_account_path = find_service_account_key()
cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred)
firestore_db = firestore.client()

# MongoDB 연결
uri = "mongodb+srv://shinws8908:dnfhlao1@cluster0.h7c55.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongo_client = MongoClient(uri)
mongo_db = mongo_client['scraping_db']

# Firebase 사용자 UID 목록
firebase_users = [
    {"email": "dntjd@gmail.com", "uid": "SQQmqVjh6nMPXxLNxgm1bC"},
    {"email": "xptmxm1@gamil.com", "uid": "fzGbBirSh0QAzNmqw4EvA4q"},
    {"email": "tlsdntjd89@naver.com", "uid": "mWPzCNrk5KR9jSCVt4D264u"},
    {"email": "tlswkehd@naver.com", "uid": "fRlCykBJCQafHjuqNHj9ckANR"},
    {"email": "lackas@naver.com", "uid": "USyyGRIBW1MYhDeWdjQuh3I"},
    {"email": "shinws8908@naver.com", "uid": "0JPleJNXt9Sy54bzQMwY3yBt"},
    {"email": "escape8908@gmail.com", "uid": "2Z141iE7eresjv2GsnFPdJ3KZ"},
    {"email": "shinws8908@gmail.com", "uid": "FANMdII6TrMHpAmcgkZNyyJ"},
    {"email": "tlswkehd@gmail.com", "uid": "Bz2kHjnWoySF9NYes40UYGG"}
]

def flatten_dict(d, parent_key='', sep='_'):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def load_data(source):
    if source == "MongoDB":
        data = list(mongo_db.users.find())
    else:  # Firestore
        data = [doc.to_dict() for doc in firestore_db.collection('users').get()]
    
    flattened_data = [flatten_dict(item) for item in data]
    df = pd.DataFrame(flattened_data)
    return df

def create_user(uid, email):
    user_data = {
        "_id": uid,
        "user_info": {
            "email": email,
            "membershipLevel": "Basic",
            "remainingCredits": 10
        },
        "config": {
            "market": 0,
            "min_price": 0,
            "max_price": 1000000000,
            "option": "전체구매건수",
            "skip_words": [],
            "markets": []
        },
        "collected_products": [],
        "market_db": {},
        "search_results": []
    }
    
    mongo_db.users.update_one({"_id": uid}, {"$set": user_data}, upsert=True)
    print(f"사용자 '{uid}' 생성 또는 업데이트됨")

def sync_data():
    # Firestore에서 MongoDB로 데이터 동기화
    firestore_users = firestore_db.collection('users').get()
    for user in firestore_users:
        user_data = user.to_dict()
        user_data['_id'] = user.id
        mongo_db.users.update_one({'_id': user.id}, {'$set': user_data}, upsert=True)
    
    # MongoDB에서 Firestore로 데이터 동기화
    mongo_users = mongo_db.users.find()
    for user in mongo_users:
        user_id = user.pop('_id')
        firestore_db.collection('users').document(user_id).set(user)

class DatabaseManager(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Database Manager")
        self.setGeometry(100, 100, 1000, 600)

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.layout = QVBoxLayout(self.central_widget)

        self.setup_ui()
        self.load_data("MongoDB")

    def setup_ui(self):
        # 상단 컨트롤
        controls = QHBoxLayout()
        self.source_combo = QComboBox()
        self.source_combo.addItems(["MongoDB", "Firestore"])
        self.source_combo.currentTextChanged.connect(self.on_source_changed)
        self.filter_input = QLineEdit()
        self.filter_input.setPlaceholderText("Filter...")
        self.apply_filter_btn = QPushButton("Apply Filter")
        self.apply_filter_btn.clicked.connect(self.apply_filter)
        controls.addWidget(QLabel("Data Source:"))
        controls.addWidget(self.source_combo)
        controls.addWidget(self.filter_input)
        controls.addWidget(self.apply_filter_btn)
        self.layout.addLayout(controls)

        # 테이블
        self.table = QTableWidget()
        self.layout.addWidget(self.table)

        # 하단 버튼
        buttons = QHBoxLayout()
        self.refresh_btn = QPushButton("Refresh")
        self.refresh_btn.clicked.connect(self.refresh_data)
        self.export_btn = QPushButton("Export to CSV")
        self.export_btn.clicked.connect(self.export_to_csv)
        self.upload_template_btn = QPushButton("Upload Template")
        self.upload_template_btn.clicked.connect(self.upload_template)
        self.sync_btn = QPushButton("Sync Databases")
        self.sync_btn.clicked.connect(self.sync_databases)
        buttons.addWidget(self.refresh_btn)
        buttons.addWidget(self.export_btn)
        buttons.addWidget(self.upload_template_btn)
        buttons.addWidget(self.sync_btn)
        self.layout.addLayout(buttons)

    def on_source_changed(self, source):
        self.load_data(source)

    def load_data(self, source):
        try:
            self.df = load_data(source)
            self.update_table(self.df)
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to load data: {str(e)}")

    def update_table(self, df):
        self.table.setRowCount(df.shape[0])
        self.table.setColumnCount(df.shape[1])
        self.table.setHorizontalHeaderLabels(df.columns)

        for row in range(df.shape[0]):
            for col in range(df.shape[1]):
                item = QTableWidgetItem(str(df.iloc[row, col]))
                self.table.setItem(row, col, item)

        self.table.resizeColumnsToContents()

    def apply_filter(self):
        filter_text = self.filter_input.text().lower()
        filtered_df = self.df[self.df.astype(str).apply(lambda x: x.str.contains(filter_text, case=False)).any(axis=1)]
        self.update_table(filtered_df)

    def refresh_data(self):
        self.load_data(self.source_combo.currentText())

    def export_to_csv(self):
        path, _ = QFileDialog.getSaveFileName(self, "Save CSV", "", "CSV Files (*.csv)")
        if path:
            try:
                self.df.to_csv(path, index=False)
                QMessageBox.information(self, "Export Successful", f"Data exported to {path}")
            except Exception as e:
                QMessageBox.critical(self, "Export Failed", f"Failed to export data: {str(e)}")

    def upload_template(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select Excel Template", "", "Excel Files (*.xlsx)")
        if file_path:
            try:
                wb = load_workbook(filename=file_path)
                stream = io.BytesIO()
                wb.save(stream)
                stream.seek(0)
                
                template_data = {
                    "name": "heyseller_template",
                    "content": stream.getvalue()
                }
                mongo_db.templates.update_one(
                    {"name": "heyseller_template"},
                    {"$set": template_data},
                    upsert=True
                )
                QMessageBox.information(self, "Upload Successful", "헤이셀러 템플릿이 성공적으로 업로드되었습니다.")
            except Exception as e:
                QMessageBox.critical(self, "Upload Failed", f"템플릿 업로드 중 오류 발생: {str(e)}")

    def sync_databases(self):
        try:
            sync_data()
            QMessageBox.information(self, "Sync Successful", "데이터베이스 동기화가 완료되었습니다.")
            self.refresh_data()
        except Exception as e:
            QMessageBox.critical(self, "Sync Failed", f"데이터베이스 동기화 중 오류 발생: {str(e)}")

def main():
    # 모든 Firebase 사용자에 대해 MongoDB 데이터 생성
    for user in firebase_users:
        create_user(user['uid'], user['email'])

    app = QApplication(sys.argv)
    window = DatabaseManager()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
