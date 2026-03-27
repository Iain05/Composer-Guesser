package org.composerguesser.backend.dto;

public class GuessResultDto {

    private final boolean correct;
    private final String composerName;
    private final int birthYear;
    private final String era;
    private final String nationality;
    private final String composerHint;
    private final String yearHint;
    private final String eraHint;
    private final String nationalityHint;
    private final String pieceTitle;
    private final String targetComposerName;
    private final Integer compositionYear;
    private final String pieceDescription;
    private final int pointsEarned;
    private final int newStreak;

    public GuessResultDto(boolean correct, String composerName, int birthYear, String era,
                          String nationality, String composerHint, String yearHint,
                          String eraHint, String nationalityHint, String pieceTitle,
                          String targetComposerName, Integer compositionYear, String pieceDescription,
                          int pointsEarned, int newStreak) {
        this.correct = correct;
        this.composerName = composerName;
        this.birthYear = birthYear;
        this.era = era;
        this.nationality = nationality;
        this.composerHint = composerHint;
        this.yearHint = yearHint;
        this.eraHint = eraHint;
        this.nationalityHint = nationalityHint;
        this.pieceTitle = pieceTitle;
        this.targetComposerName = targetComposerName;
        this.compositionYear = compositionYear;
        this.pieceDescription = pieceDescription;
        this.pointsEarned = pointsEarned;
        this.newStreak = newStreak;
    }

    public boolean isCorrect() { return correct; }
    public String getComposerName() { return composerName; }
    public int getBirthYear() { return birthYear; }
    public String getEra() { return era; }
    public String getNationality() { return nationality; }
    public String getComposerHint() { return composerHint; }
    public String getYearHint() { return yearHint; }
    public String getEraHint() { return eraHint; }
    public String getNationalityHint() { return nationalityHint; }
    public String getPieceTitle() { return pieceTitle; }
    public String getTargetComposerName() { return targetComposerName; }
    public Integer getCompositionYear() { return compositionYear; }
    public String getPieceDescription() { return pieceDescription; }
    public int getPointsEarned() { return pointsEarned; }
    public int getNewStreak() { return newStreak; }
}
