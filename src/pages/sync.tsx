import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import client from "socket.io-client";

import { Grid, Segment, Header, Image, Icon, Container, Button }
    from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css'

const Home = () => {
    const [response, setResponse] = useState("");
    const socket = client("/test");

    useEffect(() => {
        socket.on("message", (data: string) => {
            setResponse(data);
        })
        socket.emit("message", "hello service");
    }, [])
    return (
        <>
            <Head>
                <title>同步数据</title>
            </Head>
            <Container>
                <Grid>
                    <Grid.Row>
                    </Grid.Row>
                    <Grid.Row centered columns={10}>
                        <Segment placeholder>
                            {response}
                        </Segment>
                    </Grid.Row>
                </Grid>
            </Container>
        </>
    )
}

export default Home;