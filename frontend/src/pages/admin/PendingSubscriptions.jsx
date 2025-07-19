// src/pages/admin/PendingSubscriptions.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner, Table, Button } from 'react-bootstrap';

const PendingSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingSubscriptions = async () => {
    try {
      const res = await axios.get('/api/subscriptions/pending');
      setSubscriptions(res.data);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.put(`/api/subscriptions/${id}/${action}`);
      setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
    } catch (err) {
      console.error(`Error updating subscription:`, err);
    }
  };

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  if (loading) return <Spinner animation="border" variant="primary" />;

  return (
    <div>
      <h4 className="mb-4 fw-bold text-primary">Pending Subscriptions</h4>
      {subscriptions.length === 0 ? (
        <p className="text-muted">No pending subscriptions at the moment.</p>
      ) : (
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Payment Proof</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.fullname}</td>
                <td>{sub.plan_name}</td>
                <td>${sub.amount}</td>
                <td>
                  <a href={sub.paymentProof} target="_blank" rel="noreferrer">
                    <img
                      src={sub.paymentProof}
                      alt="proof"
                      width={60}
                      style={{ objectFit: 'cover', borderRadius: 5 }}
                    />
                  </a>
                </td>
                <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleAction(sub.id, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAction(sub.id, 'reject')}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default PendingSubscriptions;
