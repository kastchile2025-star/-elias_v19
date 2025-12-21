import csv
import random
from datetime import date, timedelta

# Configuration
STUDENT_FILE = '/workspaces/peloduro_v2/public/test-data/users-consolidated-2025-CORREGIDO_v2.csv'
OUTPUT_FILE = '/workspaces/peloduro_v2/attendance-full-year-2025.csv'
START_DATE = date(2025, 3, 1)
END_DATE = date(2025, 12, 31)
TARGET_COURSE = '1ro Básico'
TARGET_SECTION = 'A'

# Status probabilities
STATUS_CHOICES = ['present', 'absent', 'late', 'excused']
STATUS_WEIGHTS = [0.90, 0.05, 0.03, 0.02]

def get_students(file_path, course, section):
    students = []
    with open(file_path, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row['course'] == course and row['section'] == section:
                students.append(row)
    return students

def generate_dates(start_date, end_date):
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() < 5:  # Monday to Friday (0-4)
            yield current_date
        current_date += timedelta(days=1)

def main():
    students = get_students(STUDENT_FILE, TARGET_COURSE, TARGET_SECTION)
    print(f"Found {len(students)} students in {TARGET_COURSE} {TARGET_SECTION}")

    with open(OUTPUT_FILE, mode='w', encoding='utf-8', newline='') as csvfile:
        fieldnames = ['date', 'course', 'section', 'studentUsername', 'rut', 'name', 'status', 'comment']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for day in generate_dates(START_DATE, END_DATE):
            date_str = day.strftime('%Y-%m-%d')
            for student in students:
                status = random.choices(STATUS_CHOICES, weights=STATUS_WEIGHTS, k=1)[0]
                writer.writerow({
                    'date': date_str,
                    'course': TARGET_COURSE,
                    'section': TARGET_SECTION,
                    'studentUsername': student['username'],
                    'rut': student['rut'],
                    'name': student['name'],
                    'status': status,
                    'comment': ''
                })
    
    print(f"Attendance file generated: {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
