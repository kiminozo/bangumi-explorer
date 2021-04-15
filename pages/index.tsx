import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { applySession } from 'next-session';
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'
import { IncomingMessage, ServerResponse } from 'http';
import { Session } from 'next-session/dist/types';
import absoluteUrl from 'next-absolute-url'
import _ from "lodash";

import { Grid, Input, Item, Container, Icon, Divider, Image, Label, Header, Rating, Button } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css'
import { StoreItem } from '../service/store';
import { login_url, getUser, AccessToken } from "../service/bangumi";


interface Result {
  items: StoreItem[]
}


interface SessionData {
  views: number;
  test: string;
  token: AccessToken;
}

interface SessionContext {
  req: IncomingMessage & { session: Session & Partial<SessionData> };
  res: ServerResponse;
}

function quarter(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (month <= 3) {
    return year + "-01";
  }
  if (month <= 6) {
    return year + "-04";
  }
  if (month <= 9) {
    return year + "-07";
  }
  return year + "-10";
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

const ItemsGroup = (props: { items: StoreItem[] }) => {
  const { items } = props;
  return (<Grid relaxed columns={6}>
    {
      _.chain(items)
        .orderBy(item => item.air_date, 'desc')
        .groupBy(item => quarter(new Date(item.air_date)))
        .toPairs()
        .map(([key, value]) => (
          <>
            <Grid.Row>
              <Grid.Column width={6}>
                <Header>{key}</Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              {
                value.map(item => (
                  <Grid.Column>
                    <Image wrapped rounded src={`/images/${item.id}`} size='small'
                    // label={{ as: 'a', color: 'blue', corner: 'right', icon: 'heart' }}
                    />
                    <Header as="div" size="tiny"
                      content={item.name_cn ?? item.name}
                      subheader={item.air_date}
                    />
                    <br />
                    {/* <Rating icon='star' defaultRating={Math.floor((item.rating.score + 0.5) / 2)} maxRating={5} /> */}
                  </Grid.Column>
                ))
              }
            </Grid.Row>
            <Divider />
          </>))
        .value()
    }
  </Grid >);

  // return (<Grid relaxed columns={6}>
  //   {
  //     _.forEach(group,))
  //     items.map(item => (
  //   <Grid.Column>
  //     <>
  //       <Image wrapped rounded src={`/images/${item.id}`} size='small'
  //         label={{ as: 'a', color: 'blue', corner: 'right', icon: 'heart' }}
  //       />
  //       <Header as="div" size="small"
  //         content={item.name_cn ?? item.name}
  //         subheader={item.air_date}
  //       />
  //       {/* <Rating icon='star' defaultRating={Math.floor((item.rating.score + 0.5) / 2)} maxRating={5} /> */}
  //     </>
  //   </Grid.Column>
  //     ))
  //   }
  // </Grid>)
}

const searchHandle = async (query: string) => {
  if (!query || query === '') {
    return [];
  }
  const response = await fetch("/anime/" + query);
  const data: Result = await response.json();
  const newItems = data.items;
  return newItems ?? [];
}

const loadHandle = async () => {
  const response = await fetch("/anime/");
  const data: Result = await response.json();
  const newItems = data.items;
  return newItems ?? [];
}

interface Props {
  domain: string;
  views: number;
  test?: string;
  avatar?: string
}

const Home = (props: Props) => {
  const { domain, views, avatar } = props;
  const [items, setItems] = useState<StoreItem[]>([]);
  const [key, setKey] = useState<string>("");

  useEffect(() => {
    const loadFn = async () => {
      let newItems;
      if (key) {
        newItems = await searchHandle(key);
      } else {
        newItems = await loadHandle();
      }
      setItems(newItems)
    }
    loadFn();
  });

  // const searchData = async (data: React.ChangeEvent<HTMLInputElement>) => {
  //   const newItems = await searchHandle(data.target.value);
  //   setItems(newItems)
  // };
  //const [loading, setLoading] = useState<boolean>(false);
  return (
    <>
      <Head>
        <title>我的番组</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Container>
        <Grid>
          <Grid.Row>

          </Grid.Row>
          <Grid.Row centered>
            <Grid.Column width={14} >
              <Input fluid icon='search' placeholder='搜索...'
                onChange={(data) => setKey(data.target.value)} >
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
                        登录
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
