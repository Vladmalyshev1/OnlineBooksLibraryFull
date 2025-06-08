import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

const Usermanagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);


  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin//users', { withCredentials: true });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container className="mt-4">
      <h2>User Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Usermanagement;
