export default function HomePage() {
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to CampusRide</h1>
      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
}
