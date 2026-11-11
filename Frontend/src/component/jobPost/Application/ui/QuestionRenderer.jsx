import { Edit2 } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useToast } from "../../../../utils/ToastContext";

const QuestionRenderer = ({
  questions = [],
  module,
  editingQuestionId,
  setEditingQuestionId,
  onQuestionChange,
  onDelete,
  answers = {},
  onAnswerChange,
  onFileChange,
  errors = {},
  mode = "CONFIG",
}) => {
  const isConfig = mode === "CONFIG";
  const isFill = mode === "FILL";
  const { showToast } = useToast();
  const DEFAULT_FILE_CONFIG = {
    multiple: false,
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
  };

  return (
    <>
      {questions.map((q, index) => {
        const questionOptions = q.options ?? q.choices ?? [];
        const questionId = q.fieldId || q.id || `q-${index}`;
        const questionLabel = q.label ?? q.question ?? "";
        const isEditing = editingQuestionId === questionId;

        return (
          <div
            key={questionId}
            className={`mb-4 my-2 transition-all
        ${isEditing ? "bg-gray-50 rounded-lg p-4 shadow-md" : ""}`}
          >
            {/* Label / Edit */}
            {isConfig && isEditing ? (
              <div className="flex flex-col gap-2 mb-2">
                <input
                  value={questionLabel}
                  onChange={(e) =>
                    onQuestionChange(module, questionId, {
                      label: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={q.required || false}
                      onChange={(e) =>
                        onQuestionChange(module, questionId, {
                          required: e.target.checked,
                        })
                      }
                      id={`required-${questionId}`}
                    />
                    <label
                      htmlFor={`required-${questionId}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Required
                    </label>
                  </div>
                  <select
                    value={q.type}
                    onChange={(e) =>
                      onQuestionChange(module, questionId, {
                        type: e.target.value,
                      })
                    }
                    className="border rounded px-2 py-1 text-sm bg-white"
                  >
                    <option value="short">Short Answer</option>
                    <option value="choice">Single Choice</option>
                    <option value="multipleChoice">Multiple Choice</option>
                    {module !== "screening" && (
                      <option value="textOnly">Question Only</option>
                    )}
                  </select>
                </div>



                {/* Options Editor for Choice Types */}
                {(q.type === "choice" ||
                  q.type === "radio" ||
                  q.type === "multipleChoice" ||
                  q.type === "checkbox") && (
                    <div className="mt-3 pl-2 border-l-2 border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        Options:
                      </p>
                      <div className="flex flex-col gap-2">
                        {(q.options || []).map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 border  ${q.type === "choice" || q.type === "radio"
                                ? "rounded-full"
                                : "rounded-sm"
                                } border-gray-400`}
                            ></div>
                            <input
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...(q.options || [])];
                                newOptions[idx] = e.target.value;
                                onQuestionChange(module, questionId, {
                                  options: newOptions,
                                });
                              }}
                              className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue"
                              placeholder={`Option ${idx + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = (q.options || []).filter(
                                  (_, i) => i !== idx,
                                );
                                onQuestionChange(module, questionId, {
                                  options: newOptions,
                                });
                              }}
                              className="text-gray-400 hover:text-red-500"
                              title="Remove option"
                            >
                              <RiDeleteBin6Line className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            onQuestionChange(module, questionId, {
                              options: [...(q.options || []), ""],
                            });
                          }}
                          className="text-blue text-xs font-medium hover:underline flex items-center gap-1 mt-1 self-start"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}

                {module === "screening" &&
                  (q.type === "choice" ||
                    q.type === "radio" ||
                    q.type === "multipleChoice" ||
                    q.type === "checkbox" ||
                    q.type === "shortAnswer") && (
                    <div className="mt-2">
                      <label className="text-xs font-medium text-gray-600">
                        Correct Answer
                      </label>
                      <input
                        value={
                          Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.join(", ")
                            : q.correctAnswer || ""
                        }
                        onChange={(e) =>
                          onQuestionChange(module, questionId, {
                            correctAnswer:
                              q.type === "multipleChoice" ||
                                q.type === "checkbox"
                                ? e.target.value
                                  .split(",")
                                  .map((v) => v.trim())
                                  .filter(Boolean)
                                : e.target.value,
                          })
                        }
                        className="w-full border px-3 py-2 rounded text-sm mt-1"
                        placeholder={
                          q.type === "multipleChoice" || q.type === "checkbox"
                            ? "Comma separated answers"
                            : "Correct answer"
                        }
                      />
                    </div>
                  )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={q.allowFileUpload || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onQuestionChange(module, questionId, {
                        allowFileUpload: checked,
                        fileConfig: checked
                          ? q.fileConfig || DEFAULT_FILE_CONFIG
                          : undefined,
                      });
                    }}
                    id={`file-${questionId}`}
                  />
                  <label
                    htmlFor={`file-${questionId}`}
                    className="text-sm font-medium mt-2 text-gray-700"
                  >
                    Allow File Upload
                  </label>
                </div>
              </div>
            ) : (
              <label className="text-xs sm:text-sm font-medium text-blue">
                {questionLabel}
                {q.required && <span className="text-red-600">*</span>}
              </label>
            )}

            <div className="flex-col space-y-2 md:space-y-0 md:grid grid-cols-4">
              {/* Preview */}
              <div className="col-span-3">
                {(q.type === "short" || q.type === "text" || q.type === "shortAnswer") && (
                  <input
                    placeholder="Short answer"
                    className="w-full border rounded-md px-4 py-2 text-xs sm:text-sm"
                    disabled={isConfig}
                    type={q.type === "text" ? "text" : "text"}
                    value={answers?.[questionId] ?? ""}
                    onChange={(e) =>
                      !isConfig &&
                      onAnswerChange?.(questionId, e.target.value)
                    }
                  />
                )}
                {!isConfig && errors?.[questionId] && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors[questionId]}
                  </p>
                )}
                {(q.type === "paragraph" || q.type === "textarea") && (
                  <textarea
                    placeholder="Paragraph answer"
                    className="w-full border rounded-md px-4 py-2 text-xs sm:text-sm"
                    disabled={isConfig}
                    value={answers?.[questionId] ?? ""}
                    onChange={(e) =>
                      !isConfig &&
                      onAnswerChange?.(questionId, e.target.value)
                    }
                  />
                )}
                {(q.type === "email" || q.type === "number" || q.type === "date") && (
                  <input
                    placeholder={
                      q.type === "email"
                        ? "Email"
                        : q.type === "number"
                          ? "Number"
                          : "Date"
                    }
                    type={q.type}
                    className="w-full border rounded-md px-4 py-2 text-xs sm:text-sm"
                    disabled={isConfig}
                    value={answers?.[questionId] ?? ""}
                    onChange={(e) =>
                      !isConfig &&
                      onAnswerChange?.(questionId, e.target.value)
                    }
                  />
                )}
                {q.type === "select" && Array.isArray(q.options || q.choices) && (
                  <select
                    className="w-full border rounded-md px-4 py-2 text-xs sm:text-sm bg-white"
                    disabled={isConfig}
                    value={answers?.[questionId] ?? ""}
                    onChange={(e) =>
                      !isConfig && onAnswerChange?.(questionId, e.target.value)
                    }
                  >
                    <option value="">Select an option</option>
                    {(q.options || q.choices).map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
                {(q.type === "paragraph" || q.type === "textarea") &&
                  !isConfig &&
                  errors?.[questionId] && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors[questionId]}
                    </p>
                  )}
                {(q.type === "choice" || q.type === "radio") &&
                  Array.isArray(q.options || q.choices) &&
                  questionOptions.map((opt, i) => (
                    <label
                      key={i}
                      className="block text-xs sm:text-sm cursor-pointer pl-2 py-1"
                    >
                      <input
                        type="radio"
                        name={questionId}
                        disabled={isConfig}
                        checked={answers?.[questionId] === opt}
                        onChange={() =>
                          !isConfig && onAnswerChange?.(questionId, opt)
                        }
                      />{" "}
                      {opt}
                    </label>
                  ))}
                {(q.type === "choice" || q.type === "radio") &&
                  !isConfig &&
                  errors?.[questionId] && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors[questionId]}
                    </p>
                  )}
                {(q.type === "multipleChoice" || q.type === "checkbox") &&
                  Array.isArray(q.options || q.choices) &&
                  questionOptions.map((opt, i) => (
                    <label
                      key={i}
                      className="block text-xs sm:text-sm cursor-pointer pl-2 py-1"
                    >
                      <input
                        type="checkbox"
                        name={questionId}
                        disabled={isConfig}
                        checked={
                          Array.isArray(answers?.[questionId]) &&
                          answers[questionId].includes(opt)
                        }
                        onChange={(e) => {
                          if (isConfig) return;
                          const prev = Array.isArray(answers?.[questionId])
                            ? answers[questionId]
                            : [];
                          const next = e.target.checked
                            ? [...prev, opt]
                            : prev.filter((v) => v !== opt);
                          onAnswerChange?.(questionId, next);
                        }}
                      />{" "}
                      {opt}
                    </label>
                  ))}
                {(q.type === "multipleChoice" || q.type === "checkbox") &&
                  !isConfig &&
                  errors?.[questionId] && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors[questionId]}
                    </p>
                  )}

                {(q.allowFileUpload || q.type === "file") && (
                  <input
                    type="file"
                    disabled={isConfig}
                    className="w-full border rounded-md px-3 py-2 text-xs sm:text-sm mt-2"
                    onChange={(e) => {
                      if (isConfig) return;
                      const file = e.target.files?.[0] || null;
                      if (file && q.fileConfig?.maxFileSize) {
                        const maxBytes = q.fileConfig.maxFileSize;
                        if (file.size > maxBytes) {
                          const maxMb = Math.ceil(maxBytes / (1024 * 1024));
                          showToast(
                            `File too large. Max allowed is ${maxMb} MB.`,
                            "error"
                          );
                          e.target.value = "";
                          return;
                        }
                      }
                      if (onFileChange) {
                        onFileChange(questionId, file);
                      } else if (file) {
                        onAnswerChange?.(questionId, file);
                      }
                    }}
                  />
                )}
                {(q.allowFileUpload || q.type === "file") &&
                  q.fileConfig?.maxFileSize && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      Max size: {Math.ceil(q.fileConfig.maxFileSize / (1024 * 1024))} MB
                    </p>
                  )}
                {!isConfig &&
                  (q.allowFileUpload || q.type === "file") &&
                  answers?.[questionId] && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected:{" "}
                      {answers[questionId]?.fileName ||
                        answers[questionId]?.name ||
                        "1 file"}
                    </p>
                  )}
                {!isConfig &&
                  (q.allowFileUpload || q.type === "file") &&
                  errors?.[questionId] && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors[questionId]}
                    </p>
                  )}
              </div>

              {/* Actions */}
              {isConfig && (
                <div className="flex gap-2 justify-end items-center">
                  {editingQuestionId === questionId ? (
                    <button
                      type="button"
                      onClick={() => setEditingQuestionId(null)}
                      className="px-2 py-2 text-xs text-white bg-green-600 rounded-md"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingQuestionId(questionId)}
                      className="px-2 py-2 bg-blue rounded-md"
                    >
                      <Edit2 className="h-4 w-4 text-white" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDelete(module, questionId)}
                    className="px-2 py-2 bg-red-500 rounded-md"
                  >
                    <RiDeleteBin6Line className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default QuestionRenderer;
