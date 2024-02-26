'use client';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/esm/Row';

export default function MyComponent() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setSubmitted(true);
  };

  return (
    <>
      {submitted ? (
        <div>
          <h2>Success!</h2>
          {/* You can add additional content here */}
        </div>
      ) : (
        <Form onSubmit={handleSubmit} action="/backend/formSubmit">
          <Form.Group className="mb-3" controlId="formName">
            <Row>
              <Col>
                <Form.Control placeholder="First name" />
              </Col>
              <Col>
                <Form.Control placeholder="Last name" />
              </Col>
            </Row>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formComment">
            <Form.Control placeholder="Type your comment here!" as="textarea" rows={3} />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      )}
    </>
  );
}
