import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ErrorState } from '../../design-system/components';
import { designTheme } from '../../design-system/theme';
import { logger } from '../logging/logger';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Unhandled application error', {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ErrorState
            title="Application recovery mode"
            description={
              this.state.error?.message ||
              'A recoverable rendering issue occurred. You can continue by retrying.'
            }
            actionLabel="Retry"
            onActionPress={this.handleReset}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: designTheme.spacing[4],
    backgroundColor: designTheme.semanticColors.background,
  },
});
