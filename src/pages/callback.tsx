import React, { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

import 'semantic-ui-css/semantic.min.css'
import { Grid, Segment, Container, Button } from 'semantic-ui-react';


const CallBackPage = () => {

    useEffect(() => {
        setTimeout(() => {
            if (window) {
                window.location.assign("/");
            }
        }, 3000);
    }, [])
    return (<>
        <Head>
            <title>解析数据</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <Container>
            <Grid>
                <Grid.Row>

                </Grid.Row>
                <Grid.Row centered columns={10}>
                    <Segment placeholder>
                        <div>
                            授权登录成功,3s后自动返回
                        </div>
                        <Link href="/">
                            <Button>返回</Button>
                        </Link>
                    </Segment>
                </Grid.Row>
            </Grid>
        </Container>
    </>)
}

export default CallBackPage;