import React, { useState, useEffect, useReducer } from 'react'
import {
    Icon, Button, Modal, Progress
} from 'semantic-ui-react';
import client from "socket.io-client";
import { LogMessage } from '../common/message';

interface SyncDialogProps {
    open: boolean;
    onFinish: () => void;
}
enum StateType { None, Running, Finish }

interface SyncDialogState {
    percent?: number;
    type: StateType;
    message?: string;
}


const SyncDialog = ({ open, onFinish }: SyncDialogProps) => {
    const [state, setState] = useState<SyncDialogState>({ type: StateType.None });

    const closeEvent = () => {
        setState({ type: StateType.None });
        onFinish();
    }
    const syncEvent = (fast: boolean) => {
        const socket = client("/sync");
        setState({ type: StateType.Running });

        socket.on("message", (data: LogMessage) => {
            console.log("rec:" + JSON.stringify(data));
            setState({
                percent: data.percent,
                type: data.complete ? StateType.Finish : StateType.Running,
                message: data.message
            })
            if (data.complete) {
                socket.disconnect();
            }
        })
        if (fast) {
            socket.emit("task:sync-fast");
        } else {
            socket.emit("task:sync");
        }
    }


    return (
        <Modal open={open} dimmer="blurring" >
            <Modal.Header>
                {state.type === StateType.None ? (
                    <Button basic icon="close" floated='right' onClick={() => closeEvent()} />
                ) : undefined
                }
                同步数据
            </Modal.Header>
            <Modal.Content>
                <Progress percent={state.percent} progress indicating success={state.type === StateType.Finish} >
                    {state.message}
                </Progress>
            </Modal.Content>
            <Modal.Actions>
                {
                    state.type === StateType.None ?
                        (
                            <Button.Group>
                                <Button color='teal' onClick={() => syncEvent(true)}>
                                    快速同步
                                </Button>
                                <Button.Or />
                                <Button color='teal' onClick={() => syncEvent(false)}>
                                    完整同步
                                </Button>
                            </Button.Group>
                        ) : (
                            <Button disabled={state.type !== StateType.Finish} positive onClick={() => closeEvent()}>
                                完成
                            </Button>
                        )
                }

            </Modal.Actions>
        </Modal>
    );
}

export default SyncDialog;