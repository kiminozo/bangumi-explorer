import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'

import 'semantic-ui-css/semantic.min.css'
import { Grid, Segment, Container, Button } from 'semantic-ui-react';



export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const userId = req.cookies.userId as string;
    console.log("userId" + userId);
    return {
        props: { userId }
    };
}

const CallBackPage = (props: { userId?: string }) => {
    const { userId } = props;
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
                        {userId ? (
                            <>
                                <div>
                                    {userId}授权登录成功
                                </div>
                                <Link href="/">
                                    <Button>返回</Button>
                                </Link>
                            </>
                        )
                            :
                            (<div>登录失败</div>)
                        }
                    </Segment>
                </Grid.Row>
            </Grid>
        </Container>
    </>)
}

export default CallBackPage;