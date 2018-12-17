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
import { SecureStore, SQLite,FileSystem } from 'expo'

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
      // const list = await SecureStore.getItemAsync('list')
      // if (list != null && list !== undefined) {
      //   this.setState({
      //     items: JSON.parse(list),
      //   })
      // }

      db.transaction((txt: any) => {
        txt.executeSql('CREATE TABLE IF NOT EXISTS items (todo_item text);')
        console.log('table created');
        txt.executeSql(
          'SELECT todo_item FROM items', [],
          ( _, { rows: { _array } }) => this.setState({ 
            items: [...this.state.items, ..._array.map(
              (todoObj) => todoObj.todo_text
            )] 
          })
        )
      })
    } catch (error) {
      // error handle
    }
  }

  _insert = async () => {
    try {
      // insert item and update state
      const {items,todoText} = this.state;
      await this.setState({
        todoText: '',
        items: [...items,todoText]
      })
      await db.transaction((txt: any) => {
        console.log('_insert is called!!!!')
        txt.executeSql(
          'INSERT INTO items ((todo_item) VALUES (?)',
          [todoText]
        )
      })
    } catch (error) {
      // error handling
    }
  }

  _delete = async (todoText: string) => {
    // find index to remove
    const {items} = this.state;
    const index = (items as string[]).indexOf(todoText)
    items.splice(index, 1)
    
    try {
      await this.setState({
        items: [...items],
      })
      await db.transaction((txt: any) => {
         console.log("todoText: " + todoText)
        txt.executeSql(
          'DELETE DROM items WHERE todo_item = ?',
          [todoText]
        )
      })
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
