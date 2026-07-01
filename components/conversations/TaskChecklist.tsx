import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

export default function TaskChecklist({
  tasks,
  completedTasks,
}: {
  tasks: string[];
  completedTasks: Set<number>;
}) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.heading}>Your goals</ThemedText>
      {tasks.map((task, index) => {
        const done = completedTasks.has(index);
        return (
          <View key={task} style={styles.row}>
            <Ionicons
              name={done ? "checkmark-circle" : "ellipse-outline"}
              size={18}
              color={done ? Colors.primaryAccentColor : Colors.subduedTextColor}
            />
            <ThemedText
              style={[styles.taskText, done && styles.taskTextDone]}
            >
              {task}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    gap: 6,
  },
  heading: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.subduedTextColor,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  taskTextDone: {
    color: Colors.subduedTextColor,
    textDecorationLine: "line-through",
  },
});
