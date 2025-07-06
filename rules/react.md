# React Rules and Best Practices

## Core Principles

- **Always prefer composition over inheritance** - React components should be composable, not hierarchical
- **Keep components pure** - Same inputs should always produce the same outputs
- **Minimize useEffect usage** - Most logic should happen during rendering or in event handlers
- **Use TypeScript strictly** - Leverage type safety throughout your React components
- **Follow React Router v7 patterns** - Use framework features (loaders/actions) over client-side workarounds

## Modern React Philosophy

### You Might Not Need useEffect

**Never use useEffect for:**
- Transforming data for rendering
- Handling user events  
- Calculations that can be done during rendering
- Resetting state when props change

```tsx
// ❌ Don't do this
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    if (userId) {
      setUser(getUserById(userId)); // Transform data in effect
    }
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// ✅ Do this instead
function UserProfile({ userId }: { userId: string }) {
  const user = userId ? getUserById(userId) : null; // Calculate during render
  return <div>{user?.name}</div>;
}
```

**Only use useEffect for:**
- Synchronizing with external systems (APIs, DOM manipulation, timers)
- Side effects that happen because a component was displayed

```tsx
// ✅ Good use of useEffect - external system sync
function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
  
  return <div>Connected to {roomId}</div>;
}
```

### Component Purity

**Always keep rendering pure:**

```tsx
// ❌ Don't mutate during rendering
function TodoList({ todos }: { todos: Todo[] }) {
  todos.push(newTodo); // Mutates input!
  return <ul>{todos.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>;
}

// ✅ Calculate new values instead
function TodoList({ todos }: { todos: Todo[] }) {
  const allTodos = [...todos, newTodo]; // Creates new array
  return <ul>{allTodos.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>;
}
```

## State Management Best Practices

### Use Enum States Instead of Boolean Flags

**Never use multiple boolean flags for related state:**

```tsx
// ❌ Don't use multiple booleans
interface FormState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

function MyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // This creates impossible states like isLoading && isSuccess
}

// ✅ Use a single enum state
type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

interface FormState {
  status: RequestStatus;
  error?: string;
}

function MyForm() {
  const [state, setState] = useState<FormState>({ status: 'idle' });
  
  const handleSubmit = async () => {
    setState({ status: 'loading' });
    try {
      await submitForm();
      setState({ status: 'success' });
    } catch (error) {
      setState({ status: 'error', error: error.message });
    }
  };
}
```

### State Structure Principles

**Group related state:**

```tsx
// ❌ Don't separate related state
const [x, setX] = useState(0);
const [y, setY] = useState(0);

// ✅ Group coordinates together
const [position, setPosition] = useState({ x: 0, y: 0 });
```

**Avoid redundant state:**

```tsx
// ❌ Don't store calculated values
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState(''); // Redundant!

// ✅ Calculate during render
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const fullName = `${firstName} ${lastName}`; // Calculated
```

**Avoid contradictory state:**

```tsx
// ❌ Multiple flags can contradict
const [isSending, setIsSending] = useState(false);
const [isSent, setIsSent] = useState(false);

// ✅ Single source of truth
type Status = 'typing' | 'sending' | 'sent';
const [status, setStatus] = useState<Status>('typing');
```

## React Router v7 Patterns

### Data Loading with Loaders

**Use loaders instead of useEffect for route data:**

```tsx
// ❌ Don't fetch in components
function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser().then(setUser).finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}

// ✅ Use route loaders
export async function loader({ params }: Route.LoaderArgs) {
  return await fetchUser(params.userId);
}

export default function UserProfile({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.name}</div>;
}
```

### Form Handling with Actions

**Use actions instead of client-side form state:**

```tsx
// ❌ Don't manage form state manually when using server actions
function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    await submitContact(formData);
    setStatus('idle');
  };
}

// ✅ Use React Router actions
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  return await submitContact({
    name: formData.get('name') as string,
    email: formData.get('email') as string,
  });
}

export default function ContactForm() {
  return (
    <Form method="post">
      <input name="name" />
      <input name="email" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

## Modern Hook Patterns

### useState vs useReducer

**Use useReducer for complex state with multiple related actions:**

```tsx
// ❌ Multiple useState for related state
function ShoppingCart() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Complex logic scattered across multiple functions
}

// ✅ useReducer for complex state
type CartState = {
  items: Item[];
  total: number;
  discountCode: string;
  status: 'idle' | 'loading' | 'error';
};

type CartAction = 
  | { type: 'ADD_ITEM'; item: Item }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'APPLY_DISCOUNT'; code: string }
  | { type: 'SET_LOADING'; loading: boolean };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.item],
        total: calculateTotal([...state.items, action.item])
      };
    // ... other cases
  }
}

function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);
}
```

### Performance Optimization

**useMemo for expensive calculations:**

```tsx
// ✅ Good use of useMemo
function ExpensiveComponent({ items }: { items: Item[] }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + complexCalculation(item), 0);
  }, [items]);
  
  return <div>{expensiveValue}</div>;
}
```

**useCallback for stable function references:**

```tsx
// ✅ Good use of useCallback when passing to memoized children
function Parent({ onItemClick }: { onItemClick: (id: string) => void }) {
  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);
  
  return <MemoizedChild onClick={handleClick} />;
}
```

**Don't overuse memoization:**

```tsx
// ❌ Unnecessary memoization
function SimpleComponent({ name }: { name: string }) {
  const greeting = useMemo(() => `Hello, ${name}!`, [name]); // Overkill
  return <div>{greeting}</div>;
}

// ✅ Simple calculation during render
function SimpleComponent({ name }: { name: string }) {
  const greeting = `Hello, ${name}!`; // Fast enough
  return <div>{greeting}</div>;
}
```

## Component Architecture

### Interface Design

**Use interface for component props:**

```tsx
// ✅ Clear, extensible interface
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onEdit?: (userId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export function UserCard({ user, onEdit, showActions = true, variant = 'default' }: UserCardProps) {
  return (
    <div className={cn('user-card', variant === 'compact' && 'user-card--compact')}>
      {/* Implementation */}
    </div>
  );
}
```

**Generic components for reusability:**

```tsx
// ✅ Generic table component
interface TableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], item: T) => React.ReactNode;
  }>;
  onRowClick?: (item: T) => void;
}

export function Table<T>({ data, columns, onRowClick }: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => <th key={String(col.key)}>{col.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} onClick={() => onRowClick?.(item)}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.render ? col.render(item[col.key], item) : String(item[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Event Handler Patterns

**Properly type event handlers:**

```tsx
// ✅ Proper event typing
interface FormProps {
  onSubmit: (data: FormData) => void;
}

function MyForm({ onSubmit }: FormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle input change
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInputChange} />
    </form>
  );
}
```

### Composition Patterns

**Use children prop for flexibility:**

```tsx
// ✅ Flexible composition with children
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={cn('card', `card--${variant}`)}>{children}</div>;
}

// Usage
<Card variant="outlined">
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <UserDetails user={user} />
  </CardContent>
</Card>
```

**Use render props for advanced composition:**

```tsx
// ✅ Render props pattern
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);
  
  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher<User> url="/api/user">
  {(user, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <Error message={error} />;
    return <UserProfile user={user} />;
  }}
</DataFetcher>
```

## Anti-Patterns to Avoid

### State Anti-Patterns

```tsx
// ❌ Don't use boolean flags for status
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

// ❌ Don't store derived state
const [users, setUsers] = useState<User[]>([]);
const [userCount, setUserCount] = useState(0); // Derive from users.length

// ❌ Don't use useEffect to sync state
useEffect(() => {
  setUserCount(users.length);
}, [users]);

// ❌ Don't mutate state directly
const addUser = (user: User) => {
  users.push(user); // Mutation!
  setUsers(users);
};
```

### Effect Anti-Patterns

```tsx
// ❌ Don't use effects for calculations
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ❌ Don't use effects for event handling
useEffect(() => {
  if (shouldSubmit) {
    handleSubmit();
    setShouldSubmit(false);
  }
}, [shouldSubmit]);

// ❌ Don't chain effects
useEffect(() => {
  setLoading(true);
}, [query]);

useEffect(() => {
  if (loading) {
    fetchData();
  }
}, [loading]);
```

### Component Anti-Patterns

```tsx
// ❌ Don't use inheritance
class BaseComponent extends React.Component {
  // Avoid class inheritance patterns
}

// ❌ Don't modify props
function UserCard({ user }: { user: User }) {
  user.name = user.name.toUpperCase(); // Don't mutate props!
  return <div>{user.name}</div>;
}

// ❌ Don't use arrays indices as keys for dynamic lists
{users.map((user, index) => 
  <UserCard key={index} user={user} /> // Bad if list can reorder
)}

// ✅ Use stable, unique identifiers
{users.map(user => 
  <UserCard key={user.id} user={user} />
)}
```

## TypeScript Integration

### Component Props

```tsx
// ✅ Clear prop interfaces with good defaults
interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

### Custom Hook Typing

```tsx
// ✅ Well-typed custom hooks
interface UseApiOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useApi<T>(url: string, options: UseApiOptions = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refetch = useCallback(() => {
    // Refetch logic
  }, [url]);
  
  useEffect(() => {
    if (options.enabled !== false) {
      refetch();
    }
  }, [url, options.enabled, refetch]);
  
  return { data, loading, error, refetch };
}
```

## Performance Best Practices

### Rendering Optimization

```tsx
// ✅ Memoize expensive child components
const ExpensiveChild = React.memo(function ExpensiveChild({ data }: { data: ComplexData }) {
  // Expensive rendering logic
  return <div>{processComplexData(data)}</div>;
});

// ✅ Split components to minimize re-renders
function UserProfile({ user }: { user: User }) {
  return (
    <div>
      <UserHeader user={user} />
      <UserDetails user={user} />
      <UserActions user={user} /> {/* Each can memo independently */}
    </div>
  );
}
```

### Bundle Optimization

```tsx
// ✅ Lazy load heavy components
const HeavyChart = React.lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

## Common Pitfalls to Avoid

1. **Using multiple boolean flags** - Use status enums instead
2. **Unnecessary useEffect** - Calculate during render when possible
3. **Mutating props or state** - Always create new objects/arrays
4. **Over-memoization** - Don't memoize everything, measure first
5. **Array indices as keys** - Use stable, unique identifiers
6. **Prop drilling** - Use context for deeply nested data
7. **Large useEffect dependencies** - Split into multiple focused effects
8. **Stale closures** - Be careful with event handlers in effects
9. **Not handling loading/error states** - Always account for async operations
10. **Class components** - Use function components with hooks instead

## React Router v7 Specific Guidelines

### Route Organization

```tsx
// ✅ Well-structured route exports
export async function loader({ params }: Route.LoaderArgs) {
  // Data loading logic
}

export async function action({ request }: Route.ActionArgs) {
  // Form submission logic
}

export function ErrorBoundary() {
  // Error handling
}

export default function Component({ loaderData }: Route.ComponentProps) {
  // Component logic
}
```

### Server State Management

```tsx
// ✅ Use framework features over client state
export async function loader() {
  return {
    users: await getUsers(),
    settings: await getSettings(),
  };
}

// Don't recreate server state in client
export default function UsersPage({ loaderData }: Route.ComponentProps) {
  // Use loaderData directly, don't fetch again
  return <UsersList users={loaderData.users} />;
}
```