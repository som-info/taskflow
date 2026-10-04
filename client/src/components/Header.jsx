import { useAuth } from '../context/AuthContext.jsx';

export default function Header({ onNewTask }) {
  const { user, logout } = useAuth();
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="brand">✅ TaskFlow</div>
      <div className="topbar__actions">
        <button className="btn btn--primary" onClick={onNewTask}>
          <span aria-hidden="true">＋</span> <span className="hide-sm">New task</span>
        </button>
        <div className="user">
          <span className="avatar" title={user.email}>{initials}</span>
          <span className="user__name hide-sm">{user.name}</span>
        </div>
        <button className="btn btn--ghost" onClick={logout}>Log out</button>
      </div>
    </header>
  );
}
