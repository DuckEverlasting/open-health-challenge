import sys, datetime, json, math, random


def get_days_list(year):
    days = []
    start = datetime.date(year, 1, 1)
    end = datetime.date(year + 1, 1, 1)
    
    for i in range((end - start).days):
        day = start + datetime.timedelta(days=i)
        days.append(day)
    return days


def get_equations():
    a = random.gauss(0, .002)
    b = random.gauss(0, .001)
    c = random.gauss(0, .001)
    d = random.gauss(1.1, .04)
    e = random.gauss(1.1, .04)
    f = random.triangular(.002, .02, .01)
    g = random.randint(0, 400)
    h = random.triangular(0, .0012, .0008) * random.choice([1, -1])

    def base_equation(x):
      return (math.sin(a * (x + g)) + math.cos(b * math.pow((x + g), d)) + math.sin(c * math.pow((x + g), e))) * f

    def include_slope(slope, x):
      pivot = (-182.5 - .5 * g) * slope
      return slope * x + pivot

    return {
      "bp": lambda x: base_equation(x) + include_slope(h / 2, x),
      "steps": lambda x: base_equation(x) + include_slope(-h * 4, x) 
    }


# noinspection SpellCheckingInspection
def get_diastolic(syst):
    return syst * random.gauss(.66, .06) + 10


# noinspection SpellCheckingInspection
def generate_data():
    generated = {"steps_per_day": [], "blood_pressure_data": []}
    days = get_days_list(2020)
    equations = get_equations()

    seed_bp = random.gauss(126, 5)
    seed_steps = random.gauss(6000, 1000)

    for i in range(random.randrange(5 * 50, 5 * 54)):
        day = random.randrange(0, 366)
        # Note: expected bp value is shifted back 7 days to simulate changes in bp lagging changes in exercise  
        expected_syst = (1 + equations["bp"](day - 7)) * seed_bp
        systolic = round(random.gauss(expected_syst, expected_syst * .07))
        diastolic = round(get_diastolic(systolic))
        generated["blood_pressure_data"].append({
            "day_index": day,
            "date": days[day].isoformat(),
            "systolic": systolic,
            "diastolic": diastolic
        })

    for i in range(len(days)):
        date = days[i]
        is_weekend = date.weekday() > 5
        expected_steps = (1 + equations["steps"](i)) * seed_steps
        steps = round(random.triangular(seed_steps - seed_steps * .66, seed_steps + seed_steps * .66, expected_steps))
        if is_weekend:
            steps = round(steps * 1.2)
        generated["steps_per_day"].append({
          "date": date.isoformat(),
          "steps": steps 
        })

    return generated


if __name__ == "__main__":
    try:
        output_name = sys.argv[1]
    except IndexError:
        output_name = "data"
    data = None
    while data is None:
      try:
        data = generate_data()
      except ValueError:
        pass
    with open(output_name + ".json", "w") as export:
        json.dump(data, export)
        export.close()
