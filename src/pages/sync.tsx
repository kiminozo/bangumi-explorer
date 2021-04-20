import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import client from "socket.io-client";

import { Grid, Segment, Progress, Container, Button, List }
    from 'semantic-ui-react';
import _ from "lodash";

import 'semantic-ui-css/semantic.min.css'
import { WorkerMessage } from '../common/message';

const LogList = ({ messages }: { messages: WorkerMessage[] }) => (
    <List ordered divided relaxed>
        {messages.map(({ message }) => (
            <List.Item>{message}</List.Item>
        ))}
    </List>
)

const messageList: WorkerMessage[] = [];

const Home = () => {
    const [messages, setMessages] = useState(messageList);
    const [percent, setPercent] = useState(0);

    useEffect(() => {
        const socket = client("/test");
        socket.on("message", (data: WorkerMessage) => {
            setPercent(data.percent);
            messageList.push(data);
            setMessages(messageList)
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
                    <Grid.Row centered>
                        <Grid.Column width={10}>
                            <Progress percent={percent} progress indicating />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row centered >
                        <Grid.Column width={10}>
                            <LogList messages={messages} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </>
    )
}

export default Home;