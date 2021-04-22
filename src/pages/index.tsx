import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import _ from "lodash";

import {
  Grid, Input, Container, Icon,
  Divider, Image, Header, Button,
  SemanticShorthandItem, LabelProps,
} from 'semantic-ui-react';

import {
  MonthRangeInput,
} from 'semantic-ui-calendar-react';

import moment from 'moment';
import 'moment/locale/zh-cn';

import 'semantic-ui-css/semantic.min.css'
import { login_url } from "../common/bangumi";
import { BgmItem, WatchType, SearchResult } from '../common/watch';
import SyncDialog from '../widget/SyncDialog'







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

// export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
//   const { origin } = absoluteUrl(req);
//   let avatar: string | null = null;
//   // console.log("token:" + req.session.token)
//   // console.log("user:" + req.session.token?.user_id ?? "");
//   // if (req.session.token && req.session.token.user_id) {

//   //   const user = await getUser(req.session.token.user_id);
//   //   avatar = user?.avatar.small ?? null;
//   // }
//   // console.log("avatar:" + avatar)

//   return {
//     props: { domain: origin, avatar }
//   };
// }

const imageLabel = (watchType?: WatchType): SemanticShorthandItem<LabelProps> => {
  switch (watchType) {
    case 'collect':
      return { color: 'blue', corner: 'right', icon: 'check' };
    case "do":
      return { color: 'olive', corner: 'right', icon: 'play' };
    case "on_hold":
      return { color: 'brown', corner: 'right', icon: 'pause' };
    case "dropped":
      return { color: 'red', corner: 'right', icon: 'ban' };
    default:
      return null;
  }
}

const defaultRange = (): string => {
  const now = new Date();
  const et = moment(now).format('YYYY-MM');
  now.setMonth(now.getMonth() - 3);
  const st = moment(now).format('YYYY-MM');
  return `${st} - ${et}`;
}

const ItemsGroup = (props: { items: BgmItem[] }) => {
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
                    <Image style={{ "overflow": "hidden" }} wrapped rounded src={`/images/${item.id}`} size='small'
                      label={imageLabel(item.watchType)}
                    />
                    <Header as='div' size="tiny">
                      <a target="_blank" href={item.url}>
                        {item.name_cn !== "" ? item.name_cn : item.name}
                      </a>
                      <Header.Subheader>
                        {item.air_date}
                      </Header.Subheader>
                    </Header>
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
  const data: SearchResult = await response.json();
  return data;
}




const Home = () => {

  const [searchResult, setSearchResult] = useState<SearchResult>({ items: [] });
  const [query, setQuery] = useState<string>("");
  const [monthRange, setMonthRange] = useState<string>(defaultRange());
  const [open, setOpen] = useState(false)

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
    const result = await loadItems(url);
    setSearchResult(result)
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
            <Grid.Column width={3}>
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
            <Grid.Column width={3} >

              {
                searchResult.uid ?
                  (
                    <Button basic icon labelPosition='left' color='teal'
                      onClick={() => setOpen(true)}>
                      <Icon name='sync' />
                        同步
                    </Button>
                  ) : (

                    <Button basic icon labelPosition='left' color='teal' onClick={
                      () => {
                        if (window) {
                          const domain = window.location.protocol + "//" + window.location.host;
                          window.location.assign(login_url(`${domain}/callback`))
                        }
                      }
                    }>
                      <Icon name='user outline' />
                        登录
                    </Button>
                  )
              }
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <ItemsGroup items={searchResult.items} />
          </Grid.Row>
        </Grid >
        <SyncDialog open={open} onFinish={() => setOpen(false)} />
      </Container>
    </>
  )
}

export default Home
