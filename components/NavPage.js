'use strict'

var PostStore = require('../stores/PostStore');
var DraftStore = require('../stores/DraftStore');
var EditStore = require('../stores/EditStore');
var HistoryStore = require('../stores/HistoryStore');
var NavBar = require('./NavBar');
var React = require('react-native');

var {
  ListView,
  StyleSheet,
  Text,
  View,
} = React;

class PostsPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.getAll = this.getAll.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.state = {
      options: dataSource.cloneWithRows(this.getAll())
    };
    this.onChange = () => {
      this.setState({
        options: dataSource.cloneWithRows(this.getAll())
      });
    };
  } 

  componentDidMount() {
    PostStore.addChangeListener(this.onChange);
    DraftStore.addChangeListener(this.onChange);
    EditStore.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    PostStore.removeChangeListener(this.onChange);
    DraftStore.removeChangeListener(this.onChange);
    EditStore.removeChangeListener(this.onChange);
  }

  getAll() {
    var list = ['All Posts'];
    if (!EditStore.isEmpty()) list.push('Currently Editing');
    if (!DraftStore.isEmpty()) list.push('Drafts');
    list.push('Help');
    var history = [];
    if (!HistoryStore.isEmpty()) history = HistoryStore.get();
    history = history.map((visit) => {
      if (visit.postURL) {
        var post = PostStore.getPost(visit.username, visit.postURL);
        post.username = visit.username;
        return post;
      } else {
        return visit;
      }
    });
    list = list.concat(history);
    return list;
  }

  render() {
    return (
      <View style={styles.page}>
        <NavBar leftButton={this.backButton} title='Constellational' rightButton={this.createButton}/>
        <ListView
          automaticallyAdjustContentInsets={false}
          dataSource={this.state.options}
          renderRow={this.renderRow}
        />
      </View>
    );
  }

  renderRow(row) {
    if (typeof row === 'string') {
      var onPress = () => this.props.navigator.push({id: 'posts', filter: row});
      return <View style={styles.option}>
        <Text onPress={onPress} style={styles.text}>{row}</Text>
      </View>;
    } else {
      var onPress = () => this.props.navigator.push({username: row.username, postURL: row.url});
      var text = row.username;
      if (row.url) text = row.data.split('\n')[0];
      return <View style={styles.option}>
        <Text onPress={onPress} style={styles.text}>{text}</Text>
      </View>;
    }
  }
}

var styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  option: {
    padding: 10
  },
  text: {
    fontSize: 18,
    fontFamily: 'System',
    padding: 8
  },
 
});

module.exports = PostsPage;
