import { Component, type ErrorInfo, type ReactNode } from "react";
import { detectLocale, messages } from "../i18n";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Busybox render failure", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const copy = messages[detectLocale()];
    return (
      <main className="fatal">
        <section role="alert">
          <div className="fatal__box" aria-hidden="true">
            !
          </div>
          <h1>{copy.fatalTitle}</h1>
          <p>{copy.fatalBody}</p>
          <button type="button" onClick={() => window.location.reload()}>
            {copy.reload}
          </button>
        </section>
      </main>
    );
  }
}
