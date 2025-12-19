import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Checkbox } from "./components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Trash2 } from "lucide-react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
        ? "https://f8-zoom-node-day-1-backend.onrender.com/api"
        : "http://localhost:3000/api");

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tasks on mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/tasks`);
            if (!response.ok) throw new Error("Failed to fetch tasks");
            const result = await response.json();
            // Lọc bỏ các task không hợp lệ (không có id hoặc title)
            const validTasks = (result.data || []).filter(
                (task) => task && task.id && task.title
            );
            setTasks(validTasks);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: newTaskTitle.trim() }),
            });

            if (!response.ok) throw new Error("Failed to add task");
            const result = await response.json();

            // Kiểm tra task trả về có hợp lệ
            if (result.data && result.data.id && result.data.title) {
                setTasks([...tasks, result.data]);
                setNewTaskTitle("");
                setError(null); // Clear error nếu thành công
            } else {
                throw new Error("Invalid task data received");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleToggleTask = async (id, isComplete, title) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    isComplete: !isComplete,
                }),
            });

            if (!response.ok) throw new Error("Failed to update task");
            const result = await response.json();

            // Cập nhật task với data hợp lệ
            if (result.data && result.data.id) {
                setTasks(
                    tasks.map((task) => (task.id === id ? result.data : task))
                );
                setError(null); // Clear error nếu thành công
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete task");

            // Xóa task khỏi danh sách
            setTasks(tasks.filter((task) => task.id !== id));
            setError(null); // Clear error nếu thành công
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Todo List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Add Task Form */}
                        <form
                            onSubmit={handleAddTask}
                            className="flex gap-2 mb-6"
                        >
                            <Input
                                type="text"
                                placeholder="Enter new task..."
                                value={newTaskTitle}
                                onChange={(e) =>
                                    setNewTaskTitle(e.target.value)
                                }
                                className="flex-1"
                            />
                            <Button type="submit">Add Task</Button>
                        </form>

                        {/* Loading State */}
                        {loading && (
                            <p className="text-center text-muted-foreground">
                                Loading tasks...
                            </p>
                        )}

                        {/* Error State */}
                        {error && (
                            <p className="text-center text-destructive mb-4">
                                Error: {error}
                            </p>
                        )}

                        {/* Tasks List */}
                        {!loading && tasks.length === 0 && (
                            <p className="text-center text-muted-foreground">
                                No tasks yet. Add one above!
                            </p>
                        )}

                        {!loading && tasks.length > 0 && (
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 p-3 border-b last:border-b-0"
                                    >
                                        <Checkbox
                                            checked={task.isComplete || false}
                                            onCheckedChange={() =>
                                                handleToggleTask(
                                                    task.id,
                                                    task.isComplete,
                                                    task.title
                                                )
                                            }
                                        />
                                        <span
                                            className={`flex-1 ${
                                                task.isComplete
                                                    ? "line-through text-muted-foreground"
                                                    : ""
                                            }`}
                                        >
                                            {task.title}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDeleteTask(task.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default App;
