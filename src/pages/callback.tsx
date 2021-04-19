import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'

import 'semantic-ui-css/semantic.min.css'
import { Grid, Segment, Header, Image, Icon, Container, Button } from 'semantic-ui-react';
import { AccessToken } from '../common/bangumi'
import { getUser } from '../service/bgm-api'


export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {

    let avatar: string | null = null;
    const userId = req.cookies.userId as string;
    console.log("userId" + userId);
    // console.log("user:" + req.session.token?.user_id ?? "");
    // if (req.session.token && req.session.token.user_id) {
    //     const user = await getUser(req.session.token.user_id);
    //     avatar = user?.avatar.large ?? null;
    // }
    // console.log("avatar:" + avatar)

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
                                    <Button>同步数据</Button>
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