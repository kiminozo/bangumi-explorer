import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Grid, Input, Item, Container, Icon } from 'semantic-ui-react';
import _ from 'lodash'

import 'semantic-ui-css/semantic.min.css'
import { StoreItem } from '../service/store';

interface Result {
  items: StoreItem[]
}

//const store = new IndexStore();
const url = "/anime/";

// export async function getServerSideProps() {
//   // Fetch data from external API
//   const res = await fetch(`https://.../data`)
//   const data = await res.json()

//   // Pass data to the page via props
//   return { props: { data } }
// }

async function search(key: string, setFun: (items: StoreItem[]) => void) {
  //const items = await store.Search(key);
  if (!key || key === '') {
    setFun([]);
    return;
  }
  const response = await fetch(url + key);
  const data: Result = await response.json();
  //console.log("res:" + JSON.stringify(data));
  const items = data.items;
  if (items) {
    setFun(items);
  }
}
async function test(count: number, setFun: (items: number) => void) {
  setFun(count + 1);
}

const ItemsGroup = (props: { items: StoreItem[] }) => {
  const { items } = props;
  return (<Item.Group divided>
    {
      items.map(item => (
        <Item>
          {/* <Item.Image size='tiny' src={item.images.medium} /> */}
          <Item.Image size='tiny' src={`/images/${item.id}`} />
          <Item.Content>
            <Item.Header>{item.name_cn}</Item.Header>
            <Item.Meta>
              <span >{item.name}</span>
              <span >{item.air_date}</span>
            </Item.Meta>
            <Item.Description>{item.summary}</Item.Description>
            <Item.Extra>
              <Icon name='file' /> {item.path}
            </Item.Extra>
          </Item.Content>

        </Item>
      ))
    }
  </Item.Group>)
}

const Home = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [count, setCount] = useState(0);
  return (
    <Container>
      <Grid>
        <Grid.Row>
          <Input action='Search' placeholder='Search...'
            onChange={(data) => search(data.target.value, setItems)} />
          <br />
        </Grid.Row>
        <Grid.Row>
          <ItemsGroup items={items} />
        </Grid.Row>
      </Grid >
    </Container>
  )
}

export default Home
