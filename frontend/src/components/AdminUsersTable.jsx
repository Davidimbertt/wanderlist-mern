const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
};

function AdminUsersTable({
  users,
  currentUserId,
  busyUserId,
  onRoleChange,
  onDelete,
}) {
  if (users.length === 0) {
    return (
      <div className="admin-empty-state">
        <span aria-hidden="true">👥</span>
        <h3>No users found</h3>
        <p>No accounts match the current search.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Joined</th>
            <th>Role</th>
            <th className="admin-table__actions">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const userId = user._id || user.id;
            const isCurrentUser =
              userId === currentUserId;
            const isBusy = busyUserId === userId;

            return (
              <tr key={userId}>
                <td>
                  <div className="admin-user">
                    <span
                      className="admin-user__avatar"
                      aria-hidden="true"
                    >
                      {user.name
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </span>

                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </td>

                <td>{formatDate(user.createdAt)}</td>

                <td>
                  <select
                    className="admin-role-select"
                    value={user.role || "user"}
                    disabled={isCurrentUser || isBusy}
                    aria-label={`Role for ${user.name}`}
                    onChange={(event) =>
                      onRoleChange(
                        userId,
                        event.target.value
                      )
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">
                      Administrator
                    </option>
                  </select>

                  {isCurrentUser && (
                    <span className="admin-you-label">
                      You
                    </span>
                  )}
                </td>

                <td className="admin-table__actions">
                  <button
                    className="admin-delete-button"
                    type="button"
                    disabled={isCurrentUser || isBusy}
                    onClick={() => onDelete(user)}
                  >
                    {isBusy ? "Working..." : "Delete"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsersTable;