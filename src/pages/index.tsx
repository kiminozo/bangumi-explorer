import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import _ from "lodash";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Grid, Input, Container, Icon,
  Divider, Image, Header, Button,
  SemanticShorthandItem, LabelProps,
  Popup, Rating, Label, Dropdown, Select
} from 'semantic-ui-react';

import {
  MonthRangeInput,
} from 'semantic-ui-calendar-react';

import moment from 'moment';
import 'moment/locale/zh-cn';

import 'semantic-ui-css/semantic.min.css'
import { login_url } from "../common/bangumi";
import { BgmItem, WatchType, SearchResult, SearchFilter } from '../common/watch';
import SyncDialog from '../widget/SyncDialog'
import ScanDialog from '../widget/ScanDialog';







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

// const summaryStyle = {
//   width: "300px",
//   margin: "30px auto",
//   backgroundColor: "#44014C",  //驼峰法
//   minHeight: "200px",
//   boxSizing: "border-box",
// };

const ItemInfo = ({ item }: { item: BgmItem }) => {
  const [copied, setCopied] = useState(false)
  return (
    <>
      <p>
        <Rating icon='star' disabled defaultRating={item.rating.score} maxRating={10} />
      </p>
      <p>
        {
          item.path ? (
            <CopyToClipboard text={item.path} onCopy={() => setCopied(true)}>
              <Label as="a" color={copied ? "teal" : undefined} >
                <Icon name='linkify' /> {item.path}
              </Label>
            </CopyToClipboard>
          ) : undefined
        }
      </p>
      <p>{item.summary}</p>
    </>
  );
}

const ItemCard = ({ item }: { item: BgmItem }) => (

  <>
    <Popup flowing hoverable style={{ "width": "400px" }} trigger={
      <Image style={{ "overflow": "hidden" }} wrapped rounded src={`/images/${item.id}`} size='small'
        label={imageLabel(item.watchType)}
      />
    }>
      <Popup.Header>{item.name}</Popup.Header>
      <Popup.Content>
        <ItemInfo item={item} />
      </Popup.Content>
    </Popup>
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
  </>

)

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
                    <ItemCard item={item} />
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

type FilterType = WatchType | "all";

interface OptType {
  key: FilterType;
  text: string;
  value: FilterType;
}

const options: OptType[] = [
  { key: 'all', text: '全部', value: 'all' },
  { key: 'do', text: '在看', value: "do" },
  { key: 'collect', text: '看过', value: "collect" },
  { key: 'dropped', text: '抛弃', value: "dropped" },
  { key: 'on_hold', text: '搁置', value: "on_hold" },
]

const Home = () => {

  const [query, setQuery] = useState<string>("");
  const [monthRange, setMonthRange] = useState<string>(defaultRange());
  const [filter, setFilter] = useState<string>("all");

  const [searchResult, setSearchResult] = useState<SearchResult>({ items: [] });

  const [openSync, setSyncOpen] = useState(false);
  const [openScan, setScanOpen] = useState(false);


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

  useEffect(() => { loadFn() }, [query, monthRange, filter]);

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
              <Input fluid placeholder='搜索...'
                onChange={(e) => setQuery(e.target.value)} >
                <input />
                <Dropdown selection compact options={options} defaultValue='all'
                  onChange={(e, { name, value }) => {
                    if (typeof (value) === 'string') {
                      setFilter(value);
                    }
                  }}
                />
              </Input>
            </Grid.Column>
            <Grid.Column width={3}>
              <MonthRangeInput
                localization='zh-cn'
                placeholder="From - To"
                value={monthRange ?? ""}
                closable
                clearable
                dateFormat='YYYY-MM'
                iconPosition="left"
                onChange={(_e, { value }) => { setMonthRange(value) }} />
            </Grid.Column>
            <Grid.Column width={3} >
              <Button.Group basic icon color='teal'>
                <Button
                  onClick={() => setScanOpen(true)}>
                  <Icon name='server' />
                </Button>
                {
                  searchResult.uid ?
                    (
                      <Button
                        onClick={() => setSyncOpen(true)}>
                        <Icon name='sync' />
                      </Button>
                    ) : (

                      <Button labelPosition='left' onClick={
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
              </Button.Group>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <ItemsGroup items={searchResult.items} />
          </Grid.Row>
        </Grid >
        {
          openSync
            ? (<SyncDialog open={true} onFinish={() => setSyncOpen(false)} />)
            : undefined
        }
        {
          openScan
            ? (<ScanDialog open={true} onFinish={() => setScanOpen(false)} />)
            : undefined
        }

      </Container>
    </>
  )
}

export default Home
