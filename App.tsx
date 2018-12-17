import React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { SecureStore, SQLite } from 'expo'

const db = SQLite.openDatabase('todo.db')
interface IState {
  todoText: string
  items: string[]
}

export default class App extends React.Component<{}, IState> {
  state = {
    todoText: '',
    items: [],
  }

  async componentDidMount() {
    console.log('ComponentDidmount')
    try {
      // get items from SecureStore
      const list = await SecureStore.getItemAsync('list')
      if (list != null && list !== undefined) {
        this.setState({
          items: JSON.parse(list),
        })
      }
    } catch (error) {
      // error handle
    }
  }

  _insert = async () => {
    try {
      // insert item and update state
      await this.setState({
        todoText: '',
        items: [...this.state.items, this.state.todoText],
      })
      await SecureStore.setItemAsync('list', JSON.stringify(this.state.items))
    } catch (error) {
      // error handling
    }
  }

  _delete = async (todoText: string) => {
    // find index to remove
    const index = (this.state.items as string[]).indexOf(todoText)
    // remove index item
    this.state.items.splice(index, 1)
    // update items state
    try {
      await this.setState({
        items: [...this.state.items],
      })
      await SecureStore.setItemAsync('list', JSON.stringify(this.state.items))
    } catch (error) {
      // error handling
    }
  }

  _listItemRender = (item: string) => {
    return (
      // touchble opacity is a wrapper to add tap actions
      <TouchableOpacity onPress={() => this._delete(item)}>
        {/* need to call function with an argument */}
        <View style={styles.listItem}>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.todoText}
          value={this.state.todoText}
          onChangeText={todoText => this.setState({ todoText })}
        />
        <FlatList
          style={styles.list}
          data={this.state.items}
          renderItem={({ item }) => this._listItemRender(item)}
          keyExtractor={(item, index) => index.toString()}
        />
        <Button title={'Add Todo'} onPress={this._insert} />
        {/* no arguments on _insert function and we can pass function on Press */}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoText: {
    width: '90%',
    marginTop: 16,
    marginBottom: 16,
    borderBottomWidth: 2,
    fontSize: 18,
    justifyContent: 'center',
  },
  list: {
    width: '100%',
    flex: 1,
  },
  listItem: {
    backgroundColor: '#4286F4',
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: 'white',
    fontSize: 18,
  },
})
