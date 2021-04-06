import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

import 'semantic-ui-css/semantic.min.css'
import { Grid, Segment, Header, Icon, Container, Button } from 'semantic-ui-react';


const CallBackPage = () => (
    <>
        <Head>
            <title>title</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <Container>
            <Segment placeholder>
                <Header icon>
                    <Icon name='search' />
                     授权登录成功
                 </Header>
                <Link href="/">
                    <Button primary>返回</Button>
                </Link>
            </Segment>
        </Container>
    </>
)

export default CallBackPage;