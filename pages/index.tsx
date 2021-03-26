import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/nav'
import { Row, Col, Grid, Button, Layout } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
//import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/antd.css'



const Home = () => (
  <>
    <Layout>
      <Header>Header</Header>
      <Sider>
        Sider
        </Sider>
      <Content>
        12314
          <Link href="/next">
          <Button >
            next
          </Button>
        </Link>
      </Content>
      <Footer>Footer</Footer>
    </Layout>
  </>
)

export default Home
