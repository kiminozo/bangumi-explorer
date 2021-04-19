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
    // console.log("token:" + req.session.token)
    // console.log("user:" + req.session.token?.user_id ?? "");
    // if (req.session.token && req.session.token.user_id) {
    //     const user = await getUser(req.session.token.user_id);
    //     avatar = user?.avatar.large ?? null;
    // }
    // console.log("avatar:" + avatar)

    return {
        props: { avatar }
    };
}

const CallBackPage = (props: { avatar: string }) => {
    const { avatar } = props;
    return (<>
        <Head>
            <title>解析数据</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <Container>
            <Grid>
                <Grid.Row>

                </Grid.Row>
                <Grid.Row centered>
                    <Segment placeholder>
                        {avatar ? (
                            <>
                                <Image src={avatar} />
                                <div>
                                    授权登录成功
                                </div>
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