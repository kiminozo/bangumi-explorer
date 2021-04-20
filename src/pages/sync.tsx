import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import client from "socket.io-client";

import { Grid, Segment, Progress, Container, Button, List }
    from 'semantic-ui-react';
import _ from "lodash";

import 'semantic-ui-css/semantic.min.css'
import { LogMessage } from '../common/message';

const LogList = ({ messages }: { messages: LogMessage[] }) => (
    <List divided relaxed as="ol">
        {messages.map(({ message }, index) => (
            <List.Item as="li" key={index}>{message}</List.Item>
        ))}
    </List>
)

const messageList: LogMessage[] = [];

const Home = () => {
    const [messages, setMessages] = useState(messageList);
    const [percent, setPercent] = useState(0);

    useEffect(() => {
        const socket = client("/test");
        socket.on("message", (data: LogMessage) => {
            console.log("rec:" + JSON.stringify(data));
            messageList.push(data);
            setPercent(data.percent);
            setMessages(messageList)
        })
        socket.emit("task:parse", { userId: 10747 });
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