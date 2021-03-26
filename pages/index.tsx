import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/nav'
import { Grid, Input, Button } from 'semantic-ui-react';
import _ from 'lodash'

import 'semantic-ui-css/semantic.min.css'
import { IndexStore, StoreItem } from '../store/store';

interface State {
  items: StoreItem[]
}

const store = new IndexStore();



async function search(key: string, setFun: (items: StoreItem[]) => void) {
  //const items = await store.Search(key);
  setFun([]);
}

const Home = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  return (
    <>
      <Input action='Search' placeholder='Search...' onChange={(data) => search(data.target.value, setItems)} />
      <Grid>
        {
          _.forEach(items, (item) => (
            <Grid.Column key={item.id}>
              {item.name_cn}
            </Grid.Column>
          ))
        }
      </Grid>
    </>
  )
}

export default Home
