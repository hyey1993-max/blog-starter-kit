import { StyleSheet, Text } from 'react-native';
import { colors, space } from '../theme';
import { Button } from './Button';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Cross-platform confirm (Alert.alert has no buttons on react-native-web). */
export function ConfirmSheet({ visible, title, message, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <Sheet
      visible={visible}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button label={confirmLabel} onPress={onConfirm} />
          <Button label="취소" variant="quiet" onPress={onCancel} />
        </>
      }
    >
      <Text style={styles.message}>{message}</Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: 15, lineHeight: 23, color: colors.muted, marginBottom: space.sm },
});
