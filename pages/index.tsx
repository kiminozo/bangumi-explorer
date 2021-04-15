import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { applySession } from 'next-session';
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'
import { IncomingMessage, ServerResponse } from 'http';
import { Session } from 'next-session/dist/types';
import absoluteUrl from 'next-absolute-url'
import _ from "lodash";

import {
  Grid, Input, Item, Container, Icon,
  Divider, Image, Label, Header, Rating, Button
} from 'semantic-ui-react';

import {
  DateInput,
  TimeInput,
  MonthRangeInput,
  DatesRangeInput
} from 'semantic-ui-calendar-react';

import moment from 'moment';
import 'moment/locale/zh-cn';

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
}

const loadItems = async (url: string) => {
  const response = await fetch(url);
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
  const { domain, avatar } = props;
  const [items, setItems] = useState<StoreItem[]>([]);
  const [query, setQuery] = useState<string>("");
  const [monthRange, setMonthRange] = useState<string>("2020-01 - 2020-12");

  const loadFn = async () => {
    let url;
    if (query) {
      url = "/anime/" + query;
    } else if (monthRange) {
      if (monthRange.split(" - ").length < 2) {
        return;
      }
      url = "/anime/r=" + monthRange;
    } else {
      url = "/anime/"
    }
    const newItems = await loadItems(url);
    setItems(newItems)
  }

  useEffect(() => { loadFn() }, [query, monthRange]);

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
            <Grid.Column width={10} >
              <Input fluid icon='search' placeholder='搜索...'
                onChange={(data) => setQuery(data.target.value)} >
              </Input>
            </Grid.Column>
            <Grid.Column width={4}>
              <MonthRangeInput
                localization='zh-cn'
                placeholder="From - To"
                value={monthRange}
                closable
                clearable
                dateFormat='YYYY-MM'
                iconPosition="left"
                onChange={(_e, { value }) => { setMonthRange(value) }} />
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
