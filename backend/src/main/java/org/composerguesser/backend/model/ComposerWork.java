package org.composerguesser.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tbl_composer_work")
public class ComposerWork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "work_id")
    private Long workId;

    @Column(name = "composer_id", nullable = false)
    private Long composerId;

    @Column(nullable = false)
    private String title;

    @Column
    private String genre;

    @Column
    private Integer year;

    public Long getWorkId() { return workId; }
    public void setWorkId(Long workId) { this.workId = workId; }

    public Long getComposerId() { return composerId; }
    public void setComposerId(Long composerId) { this.composerId = composerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
}
