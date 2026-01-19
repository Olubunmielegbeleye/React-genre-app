import React, {useReducer,  useMemo } from "react";
import SelectField from "./components/Select";
import listOfGenreOption from "./store/genre.json";
import listOfMoodOption from "./store/mood.json";

const initialState = {
  genre: "",
  mood: "",
  level: "",
  aiResponses: [],
  loading: false,
  error: null,
}

function reducer (state, action){
switch (action.type){
  case "SET_GENRE":
    return{
      ...state, genre: action.payload
    };

    case "SET_MOOD":
    return{
      ...state, mood: action.payload
    };

    case "SET_LEVEL":
    return{
      ...state, level: action.payload
    };

    case "FETCH_START":
    return{
      ...state, loading: true, error: null
    };

    case "FETCH_SUCCESS":
    return{
      ...state, loading: false, aiResponses: [...state.aiResponses, action.payload],
    };

    case "FETCH_ERROR":
    return{
      ...state, loading: false, error: action.payload
    };

    default:
      return state;
}
}

// Beginnimg of App()
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {genre, mood, level, aiResponses, loading, error,} = state;

  const availableMoodBasedOnGenre = useMemo( () => {
    return listOfMoodOption [genre] || [];  }, [genre])

    // callBack statrs here
//   const getRecommendation = useCallback(() => {
//   setAiResponses((prev) => [
//     ...prev,
//     `Genre: ${genre}, Mood: ${mood}, Level: ${level}`,
//   ]);
// }, [genre, mood, level]);

    
// fetch recommendation starts here
      const fetchRecommendations = async () => {
    if (!genre || !mood || !level) return;

    dispatch({ type: "FETCH_START" });

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No recommendation found.";

      dispatch({
        type: "FETCH_SUCCESS",
        payload: text,
      });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: "Failed to fetch recommendations",
      });
    }
  };

  
return (
    <section>
      <SelectField
        placeholder="Please select a genre"
        id="genre"
        options={listOfGenreOption}
        value={genre}
        onSelect={(value) =>
          dispatch({ type: "SET_GENRE", payload: value })
        }
      />

      <SelectField
        placeholder="Please select a mood"
        id="mood"
        options={availableMoodBasedOnGenre}
        value={mood}
        onSelect={(value) =>
          dispatch({ type: "SET_MOOD", payload: value })
        }
      />

      <SelectField
        placeholder="Please select a level"
        id="level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={level}
        onSelect={(value) =>
          dispatch({ type: "SET_LEVEL", payload: value })
        }
      />

      <button onClick={fetchRecommendations} disabled={loading}>
        {loading ? "Fetching..." : "Get Recommendation"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <br />
      <br />

      {aiResponses.map((recommendation, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{recommendation}</p>
        </details>
      ))}
    </section>
  );



}
// The end of App()

  