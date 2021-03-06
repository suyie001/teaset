// BasePage.js

'use strict';

import React, {Component, PropTypes} from 'react';
import {Platform, BackAndroid, Navigator, View} from 'react-native';

import Theme from 'teaset/themes/Theme';
import KeyboardSpace from '../KeyboardSpace/KeyboardSpace';

export default class BasePage extends Component {

  static propTypes = {
    ...View.propTypes,
    scene: PropTypes.object, //转场效果
    autoKeyboardInsets: PropTypes.bool, //自动插入键盘占用空间
    keyboardTopInsets: PropTypes.number, //插入键盘占用空间顶部偏移，用于底部有固定占用空间(如TabNavigator)的页面
  };

  static defaultProps = {
    ...View.defaultProps,
    scene: Navigator.SceneConfigs.Replace,
    autoKeyboardInsets: Platform.OS === 'ios',
    keyboardTopInsets: 0,
  };

  static contextTypes = {
    navigator: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.didMount = false; //代替被废弃的isMounted
    this.state = {
      isFocused: false,
    };
  }

  componentWillMount() {
    if (!this.backListener && Platform.OS === 'android') {
      this.backListener = BackAndroid.addEventListener('hardwareBackPress', () => this.onHardwareBackPress());
    }
  }

  componentDidMount() {
    this.didMount = true;
  }

  componentWillUnmount() {
    if (this.backListener) {
      this.backListener.remove();
      this.backListener = null;
    }
    this.didMount = false;
  }

  get navigator() {
    if (!this.context.navigator) {
      console.error('The root component is NOT TeaNavigator, then you can not use BasePage.navigator.');
      return null;
    }
    return this.context.navigator();
  }

  //Call after the scene transition by Navigator.onDidFocus
  onDidFocus() {
    if (!this.state.isFocused) this.setState({isFocused: true});
  }

  //Call before the scene transition by Navigator.onWillFocus
  onWillFocus() {
  }

  //Android hardware back key handler, default is pop to prev page
  onHardwareBackPress() {
    if (!this.context.navigator) return false;
    let navigator = this.context.navigator();
    if (!navigator) return false;
    if (navigator.getCurrentRoutes().length > 1) {
      navigator.pop();
      return true;
    }
    return false;
  }

  buildProps() {
    let {style, ...others} = this.props;
    style = [{
      flex: 1,
      height: 500,
      backgroundColor: Theme.pageColor,
    }].concat(style);
    this.props = {style, ...others};
  }

  renderPage() {
    return null;
  }

  render() {
    this.buildProps();
    
    let {autoKeyboardInsets, keyboardTopInsets, ...others} = this.props;
    return (
      <View {...others}>
        {this.renderPage()}
        {autoKeyboardInsets ? <KeyboardSpace topInsets={keyboardTopInsets} /> : null}
      </View>
    );
  }
}

