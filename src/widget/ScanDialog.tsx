import React, { useState } from 'react'
import {
    Icon, Button, Modal, Progress
} from 'semantic-ui-react';
import client from "socket.io-client";
import { LogMessage } from '../common/message';

interface ScanDialogProps {
    open: boolean;
    onFinish: () => void;
}
enum StateType { None, Running, Finish }

interface ScanDialogState {
    percent?: number;
    type: StateType;
    message?: string;
}


const ScanDialog = ({ open, onFinish }: ScanDialogProps) => {
    const [state, setState] = useState<ScanDialogState>({ type: StateType.None });

    const closeEvent = () => {
        setState({ type: StateType.None });
        onFinish();
    }
    const scanEvent = () => {
        const socket = client("/scan");
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
        socket.emit("task:scan");
    }


    return (
        <Modal open={open} dimmer="blurring" >
            <Modal.Header>
                {state.type === StateType.None ? (
                    <Button basic icon="close" floated='right' onClick={() => closeEvent()} />
                ) : undefined
                }
                扫描数据
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
                            <Button color='teal' onClick={() => scanEvent()}>
                                开始扫描
                            </Button>
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

export default ScanDialog;