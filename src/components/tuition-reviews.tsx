"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { useApiData } from "@/hooks/use-api-data";
import { api, getErrorMessage } from "@/lib/api";
import type { TuitionApplication, TuitionReview as Review } from "@/types";

export function TuitionReviews({ tuitionId, initialReviews }: { tuitionId: string; initialReviews: Review[] }) {
  const { user } = useAuth();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [newReviews, setNewReviews] = useState<Review[]>([]);
  const { data: applications } = useApiData<TuitionApplication[]>(user?.role === "student" ? "/student/applications" : null, []);
  const tuitionReviews = useMemo(
    () => [...initialReviews, ...newReviews.filter((review) => !initialReviews.some((item) => item.studentEmail === review.studentEmail))],
    [initialReviews, newReviews],
  );
  const myReview = tuitionReviews.find((review) => review.studentEmail === user?.email);
  const canReview = Boolean(
    user?.role === "student" &&
      applications.some(
        (application) =>
          application.tuitionId === tuitionId &&
          application.studentEmail === user.email &&
          application.status === "accepted",
      ),
  );
  const average = tuitionReviews.length
    ? tuitionReviews.reduce((total, review) => total + review.rating, 0) / tuitionReviews.length
    : 0;

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !canReview) {
      toast("Only students with an accepted application can review this tuition.", "error");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast("Choose a rating from 1 to 5 stars.", "error");
      return;
    }
    const trimmedFeedback = feedback.trim();
    if (!trimmedFeedback) {
      toast("Add a short note about your learning experience.", "error");
      return;
    }

    try {
      const review = await api<Review>(`/tuitions/${encodeURIComponent(tuitionId)}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: trimmedFeedback }),
      });
      setNewReviews((current) => [...current, review]);
      setRating(0);
      setFeedback("");
      toast("Thank you for sharing your learning experience.");
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  }

  return (
    <section className="dashboard-panel tuition-reviews">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">LEARNER EXPERIENCES</span>
          <h2>Reviews</h2>
        </div>
        {tuitionReviews.length > 0 && (
          <span className="review-summary" aria-label={`${average.toFixed(1)} out of 5 stars`}>
            <span aria-hidden="true">★</span> {average.toFixed(1)} · {tuitionReviews.length}{" "}
            {tuitionReviews.length === 1 ? "review" : "reviews"}
          </span>
        )}
      </div>

      {tuitionReviews.length ? (
        <div className="review-list">
          {tuitionReviews.map((review) => (
            <article className="review-item" key={`${review.studentEmail}-${review.createdAt}`}>
              <div className="review-item-heading">
                <strong>{review.studentName}</strong>
                <span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>
              <p>{review.comment}</p>
              <time dateTime={review.createdAt}>
                {new Date(review.createdAt).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </article>
          ))}
        </div>
      ) : (
        <p className="review-empty">No learner reviews yet. Feedback appears here after a student shares it.</p>
      )}

      {!user ? (
        <p className="review-permission">
          <Link href="/sign-in">Sign in</Link> to check whether you can leave a review.
        </p>
      ) : myReview ? (
        <p className="review-permission">Thanks for sharing your feedback on this tuition.</p>
      ) : canReview ? (
        <form className="review-form" onSubmit={submitReview}>
          <fieldset className="rating-fieldset">
            <legend>Your rating</legend>
            <div className="rating-picker">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name={`rating-${tuitionId}`}
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    required
                  />
                  <span aria-hidden="true">{value <= rating ? "★" : "☆"}</span>
                  <span className="sr-only">{value} stars</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="form-field">
            <label htmlFor={`review-feedback-${tuitionId}`}>Your feedback</label>
            <textarea
              id={`review-feedback-${tuitionId}`}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              maxLength={500}
              required
              placeholder="What was your learning experience like?"
            />
          </div>
          <button className="button button-small" type="submit">
            Share review
          </button>
        </form>
      ) : (
        <p className="review-permission">
          Reviews are available to students after their application is accepted.
        </p>
      )}
    </section>
  );
}
