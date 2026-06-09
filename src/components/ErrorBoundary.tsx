import { Component, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
          <Text className="text-xl font-bold text-foreground">Something went wrong</Text>
          <Text className="text-center text-sm text-muted-foreground">{this.state.message}</Text>
          <Pressable
            onPress={this.reset}
            className="mt-2 rounded-xl bg-primary px-5 py-2.5 active:opacity-80">
            <Text className="font-semibold text-primary-foreground">Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
