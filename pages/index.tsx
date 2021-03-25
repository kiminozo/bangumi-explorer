import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/nav'
import { Row, Col, Container, Jumbotron, Button } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => (
  <Container className="p-3">
    <Head>
      <title>Home</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Jumbotron>
      <h1 className="header">
        Welcome To React-Bootstrap TypeScript Example
        </h1>
    </Jumbotron>
    <h2>Buttons</h2>
    <Link href="/next">
      <Button >
        next
      </Button>
    </Link>
    <h2>Toasts</h2>
  </Container>
)

export default Home
