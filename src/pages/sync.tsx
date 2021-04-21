import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import client from "socket.io-client";

import {
    Icon, Progress, Container, Button, List,
    Segment, ButtonGroup, Label, Popup
} from 'semantic-ui-react';
import _ from "lodash";

import 'semantic-ui-css/semantic.min.css'
import { LogMessage } from '../common/message';


//const messageList: LogMessage[] = [];

const Sync = () => {
    const [messages, setMessages] = useState<LogMessage[]>([]);
    const [percent, setPercent] = useState(0);
    const [success, setSuccess] = useState(false);

    const syncEvent = (fast: boolean) => {
        const socket = client("/sync");

        messages.splice(0, messages.length);
        setMessages(messages);
        socket.on("message", (data: LogMessage) => {
            console.log("rec:" + JSON.stringify(data));
            messages.push(data);
            setPercent(data.percent);
            setMessages(messages);
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
                        <ButtonGroup compact
                            floated='right'>
                            <Popup content='快速同步' trigger={
                                <Button icon onClick={() => syncEvent(true)}>
                                    <Icon name='sync' />
                                </Button>
                            } />
                            <Popup content='完整同步' trigger={
                                <Button icon onClick={() => syncEvent(false)}>
                                    <Icon name='download' />
                                </Button>
                            } />
                        </ButtonGroup>
                                     Event Log <Label circular>{messages.length}</Label>
                    </Segment>
                    <Segment secondary>
                        <pre>
                            <ol>
                                {messages.map(({ message }, i) => (
                                    <li key={i}>{message}</li>
                                ))}
                            </ol>
                        </pre>
                    </Segment>
                </Segment.Group>
            </Container>
        </>
    )
}

export default Sync;