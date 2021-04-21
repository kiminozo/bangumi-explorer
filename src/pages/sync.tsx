import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import client from "socket.io-client";

import {
    Grid, Icon, Progress, Container, Button, List,
    Segment, ButtonGroup, Label
} from 'semantic-ui-react';
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
    const [success, setSuccess] = useState(false);

    const syncEvent = (fast: boolean) => {
        const socket = client("/sync");
        socket.on("message", (data: LogMessage) => {
            console.log("rec:" + JSON.stringify(data));
            messageList.push(data);
            setPercent(data.percent);
            setMessages(messageList);
            if (data.complete) {
                setSuccess(true);
                socket.disconnect();
            }
        })
        if (fast) {
            socket.emit("task:sync-fast", { userId: 10747 });
        } else {
            socket.emit("task:sync", { userId: 10747 });
        }
    }
    // useEffect(() => {
    //     const socket = client("/test");
    //     socket.on("message", (data: LogMessage) => {
    //         console.log("rec:" + JSON.stringify(data));
    //         messageList.push(data);
    //         setPercent(data.percent);
    //         setMessages(messageList)
    //     })
    //     socket.emit("task:parse", { userId: 10747 });
    // }, [])
    return (
        <>
            <Head>
                <title>同步数据</title>
            </Head>
            <Container >
                <Segment.Group>
                    <Segment>
                        <Progress percent={percent} progress indicating success={success} />
                        <ButtonGroup compact size='small'
                            floated='right'>
                            <Button icon onClick={() => syncEvent(true)}>
                                <Icon name='sync' />
                            </Button>
                            <Button icon onClick={() => syncEvent(false)}>
                                <Icon name='download' />
                            </Button>
                        </ButtonGroup>
                                     Event Log <Label circular>{messages.length}</Label>
                    </Segment>
                    <Segment secondary>
                        <pre>
                            {messages.map(({ message }, i) => (
                                <div key={i}>{message}</div>
                            ))}
                        </pre>
                    </Segment>
                </Segment.Group>
            </Container>
        </>
    )
}

export default Home;