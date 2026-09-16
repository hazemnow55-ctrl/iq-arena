# Structure

```text
client/
  index.html                 Arabic document shell and metadata
  src/
    App.tsx                  Single public route
    index.css                Visual system, responsive layout, puzzle primitives
    pages/Home.tsx           Landing, quiz state machine, visuals, result report
    main.tsx                 React entry point
```

## Runtime architecture

`Home` owns the three user-facing modes: `landing`, `quiz`, and `result`. The question bank is a plain immutable array. `Quiz` owns the timer and answer flow; `QuestionVisual` is a presentational renderer selected by `visual` kind; `Result` owns derived metrics and browser share/copy behavior. The design deliberately avoids a backend and external runtime assets so the generated Vite output can be deployed to GitHub Pages.
