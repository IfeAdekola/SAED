import { useState, useEffect } from "react";

import { api } from "../lib/api.js";

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    durationWeeks: "4",
    startDate: "",
    endDate: "",
    maxStudents: "40",
    hasFastTrack: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await api("/manage/courses/");
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setEditingCourse(null);
    setForm({
      title: "", description: "", category: "", price: "",
      durationWeeks: "4", startDate: "", endDate: "",
      maxStudents: "40", hasFastTrack: false,
    });
    setShowForm(true);
  }

  function startEdit(course) {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      durationWeeks: String(course.durationWeeks),
      startDate: course.startDate || "",
      endDate: course.endDate || "",
      maxStudents: String(course.maxStudents),
      hasFastTrack: course.hasFastTrack,
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price) || 0,
        durationWeeks: parseInt(form.durationWeeks) || 4,
        maxStudents: parseInt(form.maxStudents) || 40,
      };
      if (editingCourse) {
        await api(`/manage/courses/${editingCourse.id}/`, { method: "PATCH", body });
      } else {
        await api("/manage/courses/", { method: "POST", body });
      }
      setShowForm(false);
      loadCourses();
    } catch (err) {
      alert(err.message || "Failed to save course");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCourse(id) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api(`/manage/courses/${id}/`, { method: "DELETE" });
      loadCourses();
    } catch (err) {
      alert("Failed to delete course");
    }
  }

  if (loading) return <div className="page-container"><p>Loading courses...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Courses</h1>
        <button className="primary-button" onClick={startCreate}>+ Add Course</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCourse ? "Edit Course" : "Create New Course"}</h2>
            <form onSubmit={handleSubmit}>
              <label>Course Title *
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </label>
              <label>Description
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </label>
              <div className="form-row">
                <label>Price (₦)
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" step="0.01" />
                </label>
                <label>Duration (weeks)
                  <input type="number" value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })} min="1" />
                </label>
              </div>
              <div className="form-row">
                <label>Start Date
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </label>
                <label>End Date
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </label>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.hasFastTrack} onChange={(e) => setForm({ ...form, hasFastTrack: e.target.checked })} />
                Enable Fast Track Video
              </label>
              <div className="form-actions-row">
                <button type="button" className="outline-button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="wide-button" disabled={submitting}>{submitting ? "Saving..." : "Save Course"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p className="course-meta">TRAINER: {course.trainerName}</p>
            <div className="course-details">
              <span className={`status-badge ${course.isActive ? "active" : "inactive"}`}>
                {course.isActive ? "Active" : "Inactive"}
              </span>
              <span>₦{course.price}</span>
              <span>{course.durationWeeks} weeks</span>
            </div>
            {course.hasFastTrack && <span className="fast-track-badge">Fast Track Enabled</span>}
            <div className="course-actions">
              <button className="outline-button" onClick={() => startEdit(course)}>Edit</button>
              <button className="danger-button" onClick={() => deleteCourse(course.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="empty-state">
          <p>No courses yet. Create your first course to start teaching!</p>
        </div>
      )}
    </div>
  );
}
