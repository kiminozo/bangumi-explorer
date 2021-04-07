import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { applySession } from 'next-session';
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'
import { IncomingMessage, ServerResponse } from 'http';
import { Session } from 'next-session/dist/types';
import absoluteUrl from 'next-absolute-url'

import { Grid, Input, Item, Container, Icon, Card, Image, Segment, Label, Header, Rating, Button } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css'
import { StoreItem } from '../service/store';
import { login_url, getUser, AccessToken } from "../service/bangumi";


interface Result {
  items: StoreItem[]
}

async function search(key: string, updateItem: (items: StoreItem[]) => void) {
  if (!key || key === '') {
    updateItem([]);
    return;
  }
  const response = await fetch("/anime/" + key);
  const data: Result = await response.json();
  const items = data.items;
  if (items) {
    updateItem(items);
  }
}


const ItemsGroup = (props: { items: StoreItem[] }) => {
  const { items } = props;
  return (<Grid relaxed columns={6}>
    {
      items.map(item => (
        <Grid.Column>
          <>
            <Image wrapped rounded src={`/images/${item.id}`} size='small'
              label={{ as: 'a', color: 'blue', corner: 'right', icon: 'heart' }}
            />
            <Header as="div" size="small"
              content={item.name_cn ?? item.name}
              subheader={item.air_date}
            />
            <Rating icon='star' defaultRating={Math.floor((item.rating.score + 0.5) / 2)} maxRating={5} />
          </>
        </Grid.Column>
      ))
    }
  </Grid>)
}

// const searchHandle = async (query: string) => {
//   const [items, setItems] = useState<StoreItem[]>([]);
//   if (!query || query === '') {
//     setItems([]);
//     return;
//   }
//   const response = await fetch("/anime/" + key);
//   const data: Result = await response.json();
//   const newItems = data.items;
//   if (newItems) {
//     setItems(newItems);
//   }
//   return items;
// }

interface SessionData {
  views: number;
  test: string;
  token: AccessToken;
}

interface SessionContext {
  req: IncomingMessage & { session: Session & Partial<SessionData> };
  res: ServerResponse;
}

export const getServerSideProps = async ({ req, res }: SessionContext) => {
  const { origin } = absoluteUrl(req);
  await applySession(req, res);
  req.session.views = req.session.views ? req.session.views + 1 : 1;
  let avatar: string | null = null;
  console.log("token:" + req.session.token)
  console.log("user:" + req.session.token?.user_id ?? "");
  if (req.session.token && req.session.token.user_id) {

    const user = await getUser(req.session.token.user_id);
    avatar = user?.avatar.small ?? null;
  }
  console.log("avatar:" + avatar)

  return {
    props: { domain: origin, views: req.session.views, test: req.session.test, avatar }
  };
}

const Home = (props: { domain: string, views: number, test?: string, avatar?: string }) => {
  const { domain, views, test, avatar } = props;
  const [items, setItems] = useState<StoreItem[]>([]);
  //const [loading, setLoading] = useState<boolean>(false);
  return (
    <>
      <Head>
        <title>title</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Container>
        <Grid>
          <Grid.Row>

          </Grid.Row>
          <Grid.Row centered>
            <Grid.Column width={10} >
              <Input fluid icon='search' placeholder='Search...'
                onChange={(data) => search(data.target.value, setItems)} >
              </Input>
            </Grid.Column>
            <Grid.Column width={2} >
              {
                avatar ?
                  (
                    <Image src={avatar} />
                  ) : (
                    <Link href={login_url(`${domain}/callback`)}>
                      <Button>
                        登录{views}
                      </Button>
                    </Link>
                  )
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <ItemsGroup items={items} />
          </Grid.Row>
        </Grid >
      </Container>
    </>
  )
}

export default Home
