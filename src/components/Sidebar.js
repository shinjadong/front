import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li className="active" tabIndex="0" data-tooltip="AI 소싱">
          <Link to="/search">
            <i className="fas fa-robot"></i><span className="sidebar-text">AI 소싱</span>
          </Link>
        </li>
        <li tabIndex="0" data-tooltip="REVERSE">
          <Link to="/reverse">
            <i className="fas fa-undo"></i><span className="sidebar-text">REVERSE</span>
          </Link>
        </li>
        <li tabIndex="0" data-tooltip="배송대행지">
          <Link to="/shipping">
            <i className="fas fa-truck"></i><span className="sidebar-text">배송대행지</span>
          </Link>
        </li>
        <li tabIndex="0" data-tooltip="통관번호">
          <Link to="/customs">
            <i className="fas fa-hashtag"></i><span className="sidebar-text">통관번호</span>
          </Link>
        </li>
        <li tabIndex="0" data-tooltip="제외 LIST">
          <Link to="/exclude">
            <i className="fas fa-ban"></i><span className="sidebar-text">제외 LIST</span>
          </Link>
        </li>
        <li tabIndex="0" data-tooltip="수집된 상품">
          <Link to="/collected">
            <i className="fas fa-shopping-basket"></i><span className="sidebar-text">수집된 상품</span>
          </Link>
        </li>
        <li tabIndex="0" data-tooltip="마켓 관리">
          <Link to="/markets">
            <i className="fas fa-store"></i><span className="sidebar-text">마켓 관리</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
