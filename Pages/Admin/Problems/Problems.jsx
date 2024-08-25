import styles from "./Problems.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { useEffect, useState, useId } from "react";

import TextInputForm from "./FormInput/TextInputForm";
import CategoryInput from "./FormInput/CategoryInput";
import ImageInput from "./ImageInput/ImageInput";
import AudioInput from "./AudioInput/AudioInput";
import UpdateTextForm from "./UpdateForm/UpdateTextForm";

const Problems = () => {
  const [allProblems, setAllProblems] = useState([]);
  const [mode, setMode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [problemShown, setProblemShown] = useState([]);
  const [categoryShown, setCategoryShown] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [order, setOrder] = useState(false);

  const baseUrl =
    (import.meta.env.VITE_API_URL &&
      `${import.meta.env.VITE_API_URL}/admin/problems`) ||
    "https://protein-intel.xyz/api/admin/problems";

  const fileChangedHandler = (e) => {
    // setSelectedFile(e.target.files[0]);
    const formData = new FormData();

    formData.append("problemUpload", e.target.files[0]);

    const URL =
      (import.meta.env.VITE_API_STATIC &&
        `${import.meta.env.VITE_API_STATIC}/upload/problem`) ||
      "https://protein-intel.xyz/upload/problem";

    console.log(URL);

    axios
      .post(URL, formData, {
        headers: { "auth-token": localStorage.getItem("token") },
      })
      .then((res) => {
        console.log(res.data);
        setSelectedFile(res.data.problem);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fileCanceledHandler = (e) => {
    setSelectedFile(null);
  };

  const showAllProblemHandler = async () => {
    setIsLoading(true);
    let response;
    try {
      response = await axios.get(baseUrl, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });
    } catch (error) {
      return console.log(error);
    }
    if (!response) {
      return console.log("Error");
    }
    if (response.data.problems) {
      setAllProblems(response.data.problems);
    }
    if (response.data.error) {
      console.log(response.data.error);
    }
  };

  useEffect(() => {
    let chosenProblem =
      categoryShown == ""
        ? allProblems
        : allProblems.filter((problem) => problem.type === categoryShown);

    if (order) {
      chosenProblem = chosenProblem.slice().reverse();
    }

    setProblemShown(chosenProblem);
    setIsLoading(false);
  }, [categoryShown, order, allProblems]);

  const addProblemHandler = async (e) => {
    e.preventDefault();

    let choice = [];
    for (let i = 0; i < 4; i++) {
      choice[i] = e.target[`choice-${i + 1}`].value;
    }

    setIsLoading(true);
    let response;
    try {
      response = await axios.post(
        baseUrl,
        {
          description: e.target.description.value,
          key: e.target.key.value,
          type: e.target.type.value,
          problemPath: selectedFile,
          choice: choice,
        },
        {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      setSelectedFile(null);
    } catch (error) {
      return console.log(error);
    }
    setIsLoading(false);
    if (!response) {
      return console.log("Error Connecting to server");
    }
    if (response.data.message) {
      console.log(response.data.message);
      setMode("");
    }
    if (response.data.error) {
      console.log(response.data.error);
      setMode("");
    }
  };

  const deleteProblemHandler = async (e) => {
    setIsLoading(true);
    let response;
    try {
      response = await axios.delete(`${baseUrl}/${e.target.dataset.id}`, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });
    } catch (error) {
      return console.log(error);
    }
    setIsLoading(false);

    if (!response) {
      return console.log("error Connecting to server");
    } else {
      showAllProblemHandler();
    }
  };

  const [selectedProblem, setSelectedProblem] = useState({});
  const selectProblem = (e) => {
    setSelectedProblem({ ...e.target.dataset });
    setMode("update");
  };

  const updateProblemHandler = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    let choice = [];
    for (let i = 0; i < 4; i++) {
      choice[i] = e.target[`choice-${i + 1}`].value;
    }

    console.log(e.target.description.value);

    let response;
    try {
      response = await axios.patch(
        `${baseUrl}/${e.target.id.value}`,
        {
          description: e.target.description.value,
          key: e.target.key.value,
          type: e.target.type.value,
          choice: choice,
          problemPath: selectedFile,
        },
        {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
    } catch (error) {
      return console.log(error);
    } finally {
      setSelectedFile(null);
      setIsLoading(false);
    }
    if (!response) {
      return console.log("error Connecting to server");
    }
    if (response.data.message) {
      console.log(response.data.message);
      showAllProblemHandler().then(setMode(""));
      setIsLoading(false);
    }
    if (response.data.error) {
      console.log(response.data.error);
    }
  };

  useEffect(() => {
    setCategoryShown("");
    setOrder(false);

    if (mode !== "search" && mode !== "update") {
      setSelectedProblem(null);
    }

    window.scrollTo(0, 0);
  }, [mode]);

  return (
    <>
      <Link to="/admin">
        <div className={styles["go-back-home"]}>Go back to Admin Homepage</div>
      </Link>
      <div className={styles.container}>
        {isLoading && (
          <div className={styles["loading-container"]}>Loading...</div>
        )}
        <div className={styles["input-container"]}>
          <div className={styles["show-problem-container"]}>
            <h3>Search Problems</h3>
            {mode === "search" ? (
              <>
                <div>
                  <button onClick={showAllProblemHandler}>
                    Reload Show Problem
                  </button>
                </div>

                <p>Problem Category</p>
                <input
                  type="radio"
                  id="category-search-0"
                  name="category-search"
                  required
                  defaultChecked
                  onChange={() => {
                    setCategoryShown("");
                  }}
                />
                <label htmlFor="category-search-0">All Category</label>
                <input
                  type="radio"
                  id="category-search-1"
                  name="category-search"
                  required
                  onChange={() => {
                    setCategoryShown("reading");
                  }}
                />
                <label htmlFor="category-search-1">Reading</label>
                <input
                  type="radio"
                  id="category-search-2"
                  name="category-search"
                  required
                  onChange={() => {
                    setCategoryShown("structure");
                  }}
                />
                <label htmlFor="category-search-2">Structure</label>
                <input
                  type="radio"
                  id="category-search-3"
                  name="category-search"
                  required
                  onChange={() => {
                    setCategoryShown("listening");
                  }}
                />
                <label htmlFor="category-search-3">Listening</label>
                <p>Show Order</p>
                <input
                  type="radio"
                  id="order-1"
                  name="order"
                  required
                  defaultChecked
                  onChange={() => {
                    setOrder(false);
                  }}
                />
                <label htmlFor="order-1">Oldest to Newest</label>
                <input
                  type="radio"
                  id="order-2"
                  name="order"
                  required
                  onChange={() => {
                    setOrder(true);
                  }}
                />
                <label htmlFor="order-2">Newest to Oldest</label>
              </>
            ) : (
              <button
                onClick={() => {
                  showAllProblemHandler().then(setMode("search"));
                }}
              >
                Show Problem
              </button>
            )}
          </div>

          <div className={styles["add-problems"]}>
            <h3>Add Problems</h3>
            <div className={styles.buttons}>
              <button
                onClick={() => {
                  setMode("text");
                }}
              >
                Type Text
              </button>
              <button
                onClick={() => {
                  setMode("image");
                }}
              >
                Type Image
              </button>
              <button
                onClick={() => {
                  setMode("audio");
                }}
              >
                Type Audio
              </button>
            </div>
          </div>
        </div>
        {mode === "search" && (
          <>
            <h3>Total: {problemShown.length} problem</h3>
            {problemShown.map((problem) => (
              <div className={styles.problem} key={problem["_id"]}>
                <h3>Id {problem["_id"]}</h3>
                <h4>Question Category</h4>
                <p>{problem.type}</p>
                {problem.associatedFile && (
                  <>
                    <h4>File Used</h4>
                    {problem.type == "listening" ? (
                      <audio controls>
                        <source
                          src={
                            (import.meta.env.VITE_API_STATIC &&
                              `${import.meta.env.VITE_API_STATIC}${
                                problem.associatedFile
                              }`) ||
                            `https://protein-intel.xyz/${problem.associatedFile}`
                          }
                          type="audio/mpeg"
                        />
                      </audio>
                    ) : (
                      <img
                        className={styles["image-file"]}
                        src={
                          (import.meta.env.VITE_API_STATIC &&
                            `${import.meta.env.VITE_API_STATIC}${
                              problem.associatedFile
                            }`) ||
                          `https://protein-intel.xyz/${problem.associatedFile}`
                        }
                        alt="server failed to retrieve file"
                      />
                    )}
                  </>
                )}
                <h4>Question</h4>
                <div
                  className={styles.description}
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                ></div>
                <h4>Choice</h4>
                <ol type="A">
                  {problem.choice.map((choice, index) => (
                    <li key={index}>
                      {" "}
                      <pre>{choice}</pre>{" "}
                    </li>
                  ))}
                </ol>
                <h4>Key</h4>
                {problem.key}
                <div>
                  <input
                    type="button"
                    value="Edit Problem"
                    onClick={selectProblem}
                    data-id={problem["_id"]}
                    data-type={problem.type}
                    data-associated-file={problem.associatedFile}
                    data-description={problem.description}
                    data-choice-1={problem.choice[0]}
                    data-choice-2={problem.choice[1]}
                    data-choice-3={problem.choice[2]}
                    data-choice-4={problem.choice[3]}
                    data-key={problem.key}
                  />
                  <input
                    type="button"
                    value="Delete Problem"
                    data-id={problem["_id"]}
                    onClick={deleteProblemHandler}
                  />
                </div>
              </div>
            ))}
          </>
        )}
        {mode === "update" && (
          <div>
            <h3>Update Problem</h3>
            <UpdateTextForm
              handler={updateProblemHandler}
              fileChangeHandler={fileChangedHandler}
              fileCancelHandler={fileCanceledHandler}
              problem={selectedProblem}
            />
          </div>
        )}
        {mode === "text" && (
          <div>
            <h3>Add Problem Type Text</h3>
            <TextInputForm handler={addProblemHandler}>
              <CategoryInput categories={["Reading", "Structure"]} />
            </TextInputForm>
          </div>
        )}
        {mode === "image" && (
          <div>
            <h3>Add Problem Type Image</h3>
            <TextInputForm handler={addProblemHandler}>
              <CategoryInput categories={["Reading", "Structure"]} />
              <ImageInput fileChangeHandler={fileChangedHandler} />
            </TextInputForm>
          </div>
        )}
        {mode === "audio" && (
          <div>
            <h3>Add Problem Type Audio</h3>
            <TextInputForm handler={addProblemHandler}>
              <input
                type="radio"
                id="problem-type-listening"
                name="type"
                value="listening"
                defaultChecked
                required
              />
              <label htmlFor="problem-type-listening">Listening</label>
              <AudioInput fileChangeHandler={fileChangedHandler} />
            </TextInputForm>
          </div>
        )}
      </div>
    </>
  );
};

export default Problems;
